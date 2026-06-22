import React, { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../services/websocket";
import { api } from "../services/api";
import {
  Phone, User, Activity, Mic, BrainCircuit, Wifi, WifiOff,
  Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, Radio
} from "lucide-react";

interface TranscriptMsg { speaker: "ai" | "customer"; text: string; stage?: string; }
interface CallSummary { summary: string; leadScore: number; actionItem: string; demoTime?: string; objections?: string; }
interface LiveCall {
  callSid: string; phoneNumber?: string; to?: string; from?: string;
  status: string; transcript: TranscriptMsg[]; aiSpeaking: boolean;
  stage?: string; campaignId?: string; summary?: CallSummary; durationSec?: number;
}
interface Callback { callSid: string; phone?: string; actionItem: string; demoTime?: string; summary?: string; leadScore?: number; createdAt: string; }
interface HistoryCall extends LiveCall { startedAt?: string; }

const actionLabel: Record<string, string> = {
  demo_booked: "✅ Demo Booked",
  callback_requested: "📞 Callback Requested",
  not_interested: "❌ Not Interested",
  interested: "🔥 Interested",
};

const TranscriptBubble = ({ msg }: { msg: TranscriptMsg }) => (
  <div className={`flex ${msg.speaker === "ai" ? "justify-start" : "justify-end"}`}>
    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
      msg.speaker === "ai"
        ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-sm"
        : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md"
    }`}>
      <div className="flex items-center gap-2 mb-1.5 opacity-60">
        {msg.speaker === "ai" ? <BrainCircuit className="w-3 h-3" /> : <User className="w-3 h-3" />}
        <span className="text-[10px] uppercase tracking-wider font-bold">
          {msg.speaker === "ai" ? "Alex (AI)" : "Customer"}
        </span>
        {msg.stage && <span className="text-[9px] opacity-70">· {msg.stage}</span>}
      </div>
      <p className="text-sm leading-relaxed">{msg.text}</p>
    </div>
  </div>
);

export default function LiveMonitor() {
  const [calls, setCalls] = useState<Record<string, LiveCall>>({});
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  const [history, setHistory] = useState<HistoryCall[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [selectedHistoryCall, setSelectedHistoryCall] = useState<HistoryCall | null>(null);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<"live" | "recent" | "callbacks" | "history">("live");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const mergeCalls = useCallback((live: any[], recent: any[]) => {
    setCalls(prev => {
      const next = { ...prev };
      [...live, ...recent].forEach((s: any) => {
        const sid = s.callSid;
        const msgs: TranscriptMsg[] = (s.transcript || []).map((t: any) => ({ speaker: t.speaker, text: t.text, stage: t.stage }));
        next[sid] = {
          callSid: sid, phoneNumber: s.to || s.from, to: s.to, from: s.from,
          status: s.status,
          transcript: msgs.length > 0 ? msgs : (next[sid]?.transcript || []),
          aiSpeaking: next[sid]?.aiSpeaking || false,
          stage: s.stage || next[sid]?.stage, campaignId: s.campaignId,
          summary: next[sid]?.summary, durationSec: s.durationSec,
        };
      });
      return next;
    });
  }, []);

  const fetchLive = useCallback(async () => {
    try {
      const res = await api.get("/call/live");
      const { live = [], recent = [] } = res.data;
      mergeCalls(live, recent);
      if (live.length > 0) setSelectedSid(sid => sid || live[0].callSid);
    } catch (_) {}
  }, [mergeCalls]);

  const fetchCallbacks = useCallback(async () => {
    try { const res = await api.get("/call/callbacks"); setCallbacks(res.data.callbacks || []); } catch (_) {}
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      const res = await api.get(`/call/history?page=${page}&limit=15`);
      setHistory(res.data.history || []);
      setHistoryTotal(res.data.total || 0);
      setHistoryPage(page);
      if (res.data.history?.length > 0 && !selectedHistoryCall) setSelectedHistoryCall(res.data.history[0]);
    } catch (_) {}
  }, [selectedHistoryCall]);

  useEffect(() => {
    fetchLive(); fetchCallbacks();
    const p1 = setInterval(fetchLive, 4000);
    const p2 = setInterval(fetchCallbacks, 10000);
    return () => { clearInterval(p1); clearInterval(p2); };
  }, [fetchLive, fetchCallbacks]);

  useEffect(() => { if (tab === "history") fetchHistory(1); }, [tab, fetchHistory]);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onCallStarted = (data: any) => {
      const sid = data.callSid; if (!sid) return;
      setCalls(prev => ({ ...prev, [sid]: { callSid: sid, phoneNumber: data.phoneNumber || data.to, to: data.to, from: data.from, status: "In Progress", transcript: [], aiSpeaking: false, campaignId: data.campaignId } }));
      setSelectedSid(sid); setTab("live");
    };
    const onMessage = (data: any) => {
      const sid = data.sessionId; if (!sid || !data.text) return;
      setCalls(prev => {
        const existing = prev[sid]; if (!existing) return prev;
        return { ...prev, [sid]: { ...existing, aiSpeaking: data.speaker === "ai", stage: data.stage || existing.stage, transcript: [...existing.transcript, { speaker: data.speaker, text: data.text, stage: data.stage }] } };
      });
    };
    const onCallEnded = (data: any) => {
      const sid = data.callSid; if (!sid) return;
      setCalls(prev => prev[sid] ? { ...prev, [sid]: { ...prev[sid], status: "Completed", aiSpeaking: false, durationSec: data.durationSec } } : prev);
      setTimeout(fetchLive, 3000);
    };
    const onSummary = (data: any) => {
      const sid = data.callSid; if (!sid) return;
      setCalls(prev => prev[sid] ? { ...prev, [sid]: { ...prev[sid], summary: data.analysis } } : prev);
      setTimeout(fetchCallbacks, 2000);
    };
    socket.on("connect", onConnect); socket.on("disconnect", onDisconnect);
    socket.on("call.started", onCallStarted); socket.on("conversation.message", onMessage);
    socket.on("call.ended", onCallEnded); socket.on("call.completed", onCallEnded);
    socket.on("call.summary", onSummary); socket.on("call.callback", () => setTimeout(fetchCallbacks, 1000));
    if (socket.connected) setConnected(true);
    return () => {
      socket.off("connect", onConnect); socket.off("disconnect", onDisconnect);
      socket.off("call.started", onCallStarted); socket.off("conversation.message", onMessage);
      socket.off("call.ended", onCallEnded); socket.off("call.completed", onCallEnded);
      socket.off("call.summary", onSummary); socket.off("call.callback");
    };
  }, [fetchLive, fetchCallbacks]);

  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [calls, selectedSid]);

  const callList = Object.values(calls);
  const liveCalls = callList.filter(c => !["completed","busy","failed","no-answer","canceled"].includes(c.status.toLowerCase()));
  const recentCalls = callList.filter(c => ["completed","busy","failed","no-answer","canceled"].includes(c.status.toLowerCase()));
  const selectedCall = selectedSid ? calls[selectedSid] : null;

  const tabs = [
    { key: "live", label: "Active", count: liveCalls.length },
    { key: "recent", label: "Recent", count: recentCalls.length },
    { key: "history", label: "History", count: historyTotal },
    { key: "callbacks", label: "Callbacks", count: callbacks.length },
  ];

  const CallListItem = ({ call, isSelected, onSelect, isHistory = false }: any) => (
    <div
      onClick={() => onSelect(isHistory ? call : call.callSid)}
      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
        isSelected ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{call.phoneNumber || call.callSid}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1 ${
          call.status === "Completed" || call.status === "completed" ? "bg-slate-100 dark:bg-slate-800 text-slate-500" : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
        }`}>{call.status}</span>
      </div>
      {call.stage && <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">{call.stage}</span>}
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        {call.transcript?.length || 0} msgs{call.durationSec ? ` · ${call.durationSec}s` : ""}
        {call.startedAt ? ` · ${new Date(call.startedAt).toLocaleDateString()}` : ""}
      </p>
      {call.summary?.actionItem && <p className="text-xs mt-1 font-semibold text-emerald-600 dark:text-emerald-400">{actionLabel[call.summary.actionItem] || call.summary.actionItem}</p>}
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Live Call Monitor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time AI conversation monitoring & history</p>
        </div>
        <div className="flex items-center gap-2">
          {callbacks.length > 0 && (
            <button onClick={() => setTab("callbacks")} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition-colors">
              <Calendar className="w-3.5 h-3.5" />{callbacks.length} Callbacks
            </button>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            connected ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400"
          }`}>
            {connected ? <><Wifi className="w-3.5 h-3.5" /><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live</> : <><WifiOff className="w-3.5 h-3.5" />Reconnecting...</>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit shrink-0">
        {tabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key as any)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}>
            {label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              tab === key ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Callbacks Tab */}
      {tab === "callbacks" && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {callbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 crm-card">
              <Calendar className="w-10 h-10 mb-3 opacity-20" /><p className="font-semibold">No callbacks scheduled yet</p>
              <p className="text-sm mt-1 opacity-60">Callbacks appear when customers reschedule</p>
            </div>
          ) : callbacks.map((cb, i) => (
            <div key={i} className="crm-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{cb.phone || "Unknown number"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{actionLabel[cb.actionItem] || cb.actionItem}</p>
                  {cb.demoTime && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{cb.demoTime}</p>}
                </div>
                <div className="text-right">
                  {cb.leadScore != null && <div className="text-2xl font-black text-blue-600 tabular-nums">{cb.leadScore}<span className="text-xs text-slate-400">/100</span></div>}
                  <p className="text-xs text-slate-400 mt-1">{new Date(cb.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
              {cb.summary && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">{cb.summary}</p>}
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden min-h-0">
          <div className="col-span-1 crm-card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500" /><h2 className="font-bold text-slate-900 dark:text-white text-sm">Call History</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm gap-2"><Phone className="w-6 h-6 opacity-30" />No call history yet</div>
              ) : history.map(call => (
                <CallListItem key={call.callSid} call={call} isSelected={selectedHistoryCall?.callSid === call.callSid} onSelect={(c: any) => setSelectedHistoryCall(c)} isHistory />
              ))}
            </div>
            {historyTotal > 15 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <button onClick={() => fetchHistory(historyPage - 1)} disabled={historyPage <= 1} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs text-slate-400 dark:text-slate-500">Page {historyPage} · {historyTotal} total</span>
                <button onClick={() => fetchHistory(historyPage + 1)} disabled={historyPage * 15 >= historyTotal} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="col-span-1 xl:col-span-2 crm-card flex flex-col overflow-hidden">
            {selectedHistoryCall ? (
              <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><User className="w-5 h-5 text-slate-500" /></div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-sm">{selectedHistoryCall.phoneNumber || selectedHistoryCall.callSid}</h2>
                      <p className="text-xs text-slate-400">{selectedHistoryCall.status} · {selectedHistoryCall.durationSec}s{selectedHistoryCall.startedAt ? ` · ${new Date(selectedHistoryCall.startedAt).toLocaleString()}` : ""}</p>
                    </div>
                  </div>
                  {selectedHistoryCall.summary && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-600">Score: {selectedHistoryCall.summary.leadScore}/100</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{actionLabel[selectedHistoryCall.summary.actionItem] || selectedHistoryCall.summary.actionItem}</p>
                    </div>
                  )}
                </div>
                {selectedHistoryCall.summary && (
                  <div className="mx-4 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shrink-0">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedHistoryCall.summary.summary}</p>
                    {selectedHistoryCall.summary.demoTime && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{selectedHistoryCall.summary.demoTime}</p>}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
                  {selectedHistoryCall.transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2"><BrainCircuit className="w-8 h-8 opacity-30" />No transcript recorded</div>
                  ) : selectedHistoryCall.transcript.map((msg, idx) => <TranscriptBubble key={idx} msg={msg} />)}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><Phone className="w-12 h-12 mb-3 opacity-20" /><p>Select a call to view its transcript</p></div>
            )}
          </div>
        </div>
      )}

      {/* Live / Recent Tab */}
      {(tab === "live" || tab === "recent") && (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden min-h-0">
          <div className="col-span-1 crm-card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">{tab === "live" ? "Live Calls" : "Recent Calls"}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {(tab === "live" ? liveCalls : recentCalls).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm gap-2"><Phone className="w-6 h-6 opacity-30" />{tab === "live" ? "No active calls" : "No recent calls"}</div>
              ) : (tab === "live" ? liveCalls : recentCalls).map(call => (
                <CallListItem key={call.callSid} call={call} isSelected={selectedCall?.callSid === call.callSid} onSelect={(sid: string) => setSelectedSid(sid)} />
              ))}
            </div>
          </div>

          <div className="col-span-1 xl:col-span-2 crm-card flex flex-col overflow-hidden">
            {selectedCall ? (
              <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600"><User className="w-5 h-5" /></div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-sm">{selectedCall.phoneNumber || selectedCall.callSid}</h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{selectedCall.status}{selectedCall.durationSec ? ` · ${selectedCall.durationSec}s` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCall.summary?.actionItem && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        {actionLabel[selectedCall.summary.actionItem] || selectedCall.summary.actionItem}
                      </span>
                    )}
                    {selectedCall.aiSpeaking ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600"><BrainCircuit className="w-4 h-4 animate-pulse" />AI Speaking...</div>
                    ) : selectedCall.status !== "Completed" ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><Mic className="w-4 h-4 animate-pulse" />Listening...</div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><CheckCircle className="w-4 h-4" />Completed</div>
                    )}
                  </div>
                </div>

                {selectedCall.summary && (
                  <div className="mx-4 mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shrink-0">
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5">Call Summary</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedCall.summary.summary}</p>
                    <div className="flex gap-4 mt-2.5 text-xs text-slate-500">
                      {selectedCall.summary.leadScore != null && <span className="font-bold text-blue-600">Score: {selectedCall.summary.leadScore}/100</span>}
                      {selectedCall.summary.demoTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedCall.summary.demoTime}</span>}
                      {selectedCall.summary.objections && <span>Objection: {selectedCall.summary.objections}</span>}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
                  {selectedCall.transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                      <BrainCircuit className="w-8 h-8 opacity-30 animate-pulse" />Waiting for conversation...
                    </div>
                  ) : selectedCall.transcript.map((msg, idx) => <TranscriptBubble key={idx} msg={msg} />)}
                  <div ref={transcriptEndRef} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Phone className="w-12 h-12 mb-4 opacity-20" /><p className="font-semibold">Select a call to view transcript</p>
                <p className="text-sm mt-1 opacity-60">Calls refresh every 4 seconds</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

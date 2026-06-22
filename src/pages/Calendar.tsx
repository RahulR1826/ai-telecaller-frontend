import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock, User, Phone, Tag, RefreshCw, Loader2 } from "lucide-react";
import { api } from "../services/api";

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const leadsRes = await api.get("/lead");
      const leads = leadsRes.data || [];
      const callbackRes = await api.get("/call/callbacks").catch(() => ({ data: { callbacks: [] } }));
      const callbacks = callbackRes.data.callbacks || [];

      const leadEvents = leads
        .filter((l: any) => l.callbackTime || l.nextAction)
        .map((l: any) => {
          const parts = (l.nextAction || "").split(" - ");
          const rawAction = parts[0] || "";
          const embeddedCampaign = parts.length > 1 ? parts[1] : null;
          let displayTitle = "Follow-up Call";
          if (rawAction === "demo_booked") displayTitle = "Demo Booked";
          else if (rawAction === "callback_requested") displayTitle = "Callback Requested";
          return {
            id: `lead-${l.id}`,
            title: displayTitle,
            time: l.callbackTime || "Time TBD",
            type: l.status === "booked" ? "Demo" : "Callback",
            name: l.name || l.phone,
            phone: l.phone,
            campaign: l.campaign?.name || embeddedCampaign || "Unknown Campaign",
            score: l.leadScore,
            source: "lead",
          };
        });

      const cbEvents = callbacks.map((cb: any, i: number) => ({
        id: `cb-${i}`,
        title: cb.actionItem === "demo_booked" ? "Demo Booked" : "Callback Requested",
        time: cb.demoTime || "Time TBD",
        type: cb.actionItem === "demo_booked" ? "Demo" : "Callback",
        name: cb.phone,
        phone: cb.phone,
        campaign: "AI Campaign",
        score: cb.leadScore,
        source: "callback",
        summary: cb.summary,
      }));

      const seen = new Set();
      const merged = [...leadEvents, ...cbEvents].filter(e => {
        if (seen.has(e.phone)) return false;
        seen.add(e.phone);
        return true;
      });
      setEvents(merged);
    } catch (err) {
      console.error("Calendar load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const demos = events.filter(e => e.type === "Demo").length;
  const cbs = events.filter(e => e.type === "Callback").length;

  return (
    <div className="space-y-5 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">AI-booked callbacks and demos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CalendarIcon className="w-4 h-4" />{today}
          </div>
          <button onClick={load} disabled={loading} className="btn-secondary text-xs disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {[
          { label: "Total Events", value: events.length, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
          { label: "Demos Booked", value: demos, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
          { label: "Callbacks", value: cbs, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
        ].map(({ label, value, color }) => (
          <div key={label} className="crm-card p-4 text-center">
            <p className={`text-2xl font-black tabular-nums ${color.split(" ")[0]}`}>{value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="flex-1 crm-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Scheduled Follow-ups</h2>
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
              {events.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <CalendarIcon className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-semibold">No scheduled callbacks yet</p>
              <p className="text-sm mt-1 opacity-60">Callbacks appear here after AI calls complete</p>
            </div>
          ) : events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer group bg-white dark:bg-slate-900/40"
            >
              {/* Time */}
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 sm:w-40 shrink-0">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{event.time}</span>
              </div>

              {/* Color bar */}
              <div
                className="w-1 h-10 rounded-full hidden sm:block shrink-0"
                style={{ background: event.type === "Demo" ? "#8b5cf6" : "#f59e0b" }}
              />

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />{event.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />{event.phone}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />{event.campaign}
                  </span>
                </div>
                {event.summary && <p className="text-xs text-slate-400 mt-1 truncate">{event.summary}</p>}
              </div>

              {/* Badge & score */}
              <div className="flex items-center gap-2 shrink-0">
                {event.score != null && event.score > 0 && (
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    {event.score}<span className="text-xs text-slate-400">/100</span>
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  event.type === "Demo"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                }`}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

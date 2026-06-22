import React, { useEffect, useState } from "react";
import { Search, Filter, Phone, TrendingUp, Users, Star } from "lucide-react";
import { getLeads } from "../services/api";
import { Lead } from "../types";

const statusConfig: Record<string, { cls: string; dot: string }> = {
  Interested: { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", dot: "bg-emerald-500" },
  Warm:       { cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", dot: "bg-amber-500" },
  Cold:       { cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
  Callback:   { cls: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", dot: "bg-blue-500" },
  Converted:  { cls: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400", dot: "bg-purple-500" },
  "Not Interested": { cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400", dot: "bg-rose-400" },
};

const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${score}%`,
          background: score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444",
        }}
      />
    </div>
    <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">{score}</span>
  </div>
);

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { getLeads().then(setLeads); }, []);

  const statuses = ["All", "Interested", "Warm", "Cold", "Callback", "Converted"];

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total Leads", value: leads.length, icon: Users, color: "text-blue-500" },
    { label: "Interested", value: leads.filter(l => l.status === "Interested").length, icon: Star, color: "text-emerald-500" },
    { label: "Converted", value: leads.filter(l => l.status === "Converted").length, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-5 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track and manage AI-qualified prospects.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="btn-primary text-xs">
            Import Leads
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="crm-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color}`}>
              <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="flex-1 crm-card flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or company..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all dark:text-white placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Status filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  statusFilter === s
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 z-10 backdrop-blur-sm">
              <tr>
                {["Contact", "Company", "Lead Score", "Status", "Last Activity", "Next Follow-up"].map((h) => (
                  <th key={h} className="py-3 px-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No leads found</p>
                  </td>
                </tr>
              ) : filtered.map((lead) => {
                const sc = statusConfig[lead.status] || statusConfig["Cold"];
                return (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm shrink-0">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />{lead.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-slate-600 dark:text-slate-300">{lead.company}</td>
                    <td className="py-3.5 px-5"><ScoreBar score={lead.leadScore} /></td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-slate-500 dark:text-slate-400">{lead.lastCall}</td>
                    <td className="py-3.5 px-5 text-sm font-medium text-blue-600 dark:text-blue-400">{lead.nextFollowUp || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> of{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{leads.length}</span> leads
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  PhoneCall, Users, PhoneForwarded, BrainCircuit, Activity,
  TrendingUp, TrendingDown, ArrowRight, Clock, Zap, Target,
  BarChart2, ChevronRight
} from "lucide-react";
import { getDashboardStats, getLeads, getCampaigns } from "../services/api";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  title, value, icon: Icon, trend, colorClass, subText, gradient
}: any) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} transition-transform duration-200 group-hover:scale-110`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
          trend.startsWith('+')
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
        }`}>
          {trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{value}</h3>
      </div>
      {subText && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subText}</p>}
    </div>
    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
  </div>
);

// ─── Activity Item ─────────────────────────────────────────────────────────────
const ActivityItem = ({ callback }: { callback: any }) => (
  <div className="flex items-center gap-3 py-3 group">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shrink-0 font-bold text-blue-600 dark:text-blue-400 text-xs">
      {callback.name?.charAt(0) || "?"}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{callback.name}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{callback.phone}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{callback.nextFollowUp}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Scheduled</p>
    </div>
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [callbacks, setCallbacks] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getLeads().then((leads) => {
      const scheduled = leads.filter((l: any) => l.nextFollowUp && l.nextFollowUp !== "-").slice(0, 5);
      setCallbacks(scheduled);
    });
    getCampaigns().then((campaigns) => {
      if (Array.isArray(campaigns) && campaigns.length > 0) {
        setActiveCampaign(campaigns.find((c: any) => c.status === "Active") || campaigns[0]);
      }
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const progressPct = stats.todayCalls > 0 ? Math.round((stats.completed / stats.todayCalls) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Good morning, Admin 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your AI campaigns today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {stats.active || 0} Active Calls
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            title: "Today's Calls",
            value: stats.todayCalls,
            icon: PhoneCall,
            trend: "+12%",
            colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
            gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
            subText: "Total calls initiated"
          },
          {
            title: "Interested Leads",
            value: stats.interested,
            icon: Users,
            trend: "+5%",
            colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
            gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
            subText: "High intent prospects"
          },
          {
            title: "Callbacks Pending",
            value: stats.callbacks,
            icon: PhoneForwarded,
            trend: "-2%",
            colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
            gradient: "bg-gradient-to-r from-amber-400 to-orange-500",
            subText: "Scheduled follow-ups"
          },
          {
            title: "Conversion Rate",
            value: stats.conversionRate,
            icon: BrainCircuit,
            trend: "+8pts",
            colorClass: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
            gradient: "bg-gradient-to-r from-purple-500 to-violet-600",
            subText: "AI-qualified conversions"
          },
        ].map((stat) => (
          <div key={stat.title} className="relative overflow-hidden">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Campaign Card */}
        <div className="lg:col-span-2 crm-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Campaign</h2>
            </div>
            <button className="btn-ghost text-xs">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeCampaign ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/60 dark:border-blue-800/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {activeCampaign.name || "Untitled Campaign"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {activeCampaign.businessName || activeCampaign.business || "Unknown Business"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeCampaign.status || "Active"}
                  </span>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Campaign Progress</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {stats.completed} / {stats.todayCalls} Calls · {progressPct}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Avg Duration", value: stats.avgDuration || "–", icon: Clock },
                  { label: "Completed", value: stats.completed || 0, icon: Activity },
                  { label: "Live Now", value: stats.active || 0, icon: BarChart2 },
                ].map(({ label, value, icon: I }) => (
                  <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                    <I className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-base font-black text-slate-900 dark:text-white tabular-nums">{value}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Zap className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">No active campaigns</p>
              <p className="text-sm mt-1 opacity-60">Start a campaign to see live data</p>
            </div>
          )}
        </div>

        {/* Upcoming Callbacks */}
        <div className="crm-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PhoneForwarded className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Callbacks</h2>
            </div>
            {callbacks.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800/50">
                {callbacks.length}
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {callbacks.length > 0 ? callbacks.map((callback: any, i) => (
              <ActivityItem key={i} callback={callback} />
            )) : (
              <div className="flex flex-col items-center justify-center h-36 text-slate-400">
                <PhoneForwarded className="w-9 h-9 mb-3 opacity-20" />
                <p className="text-sm font-medium">No upcoming callbacks</p>
                <p className="text-xs mt-1 opacity-60">Callbacks scheduled by AI appear here</p>
              </div>
            )}
          </div>

          {callbacks.length > 0 && (
            <button className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 rounded-xl transition-colors">
              View all callbacks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getDashboardStats } from "../services/api";
import { TrendingUp, PhoneCall, Users, Clock, BarChart3, PieChart as PieIcon } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [data, setData] = useState([{ name: "Today", calls: 0, conversions: 0 }]);

  useEffect(() => {
    getDashboardStats().then((s) => {
      setStats(s);
      setData([{ name: "Today", calls: s.todayCalls || 0, conversions: s.interested || 0 }]);
    });
  }, []);

  const pieData = stats ? [
    { name: "Interested", value: stats.interested || 0, color: "#10b981" },
    { name: "Callbacks", value: stats.callbacks || 0, color: "#f59e0b" },
    { name: "Other", value: Math.max(0, (stats.todayCalls || 0) - (stats.interested || 0) - (stats.callbacks || 0)), color: "#94a3b8" },
  ] : [];

  const kpis = stats ? [
    { label: "Today's Calls", value: stats.todayCalls, subValue: `${stats.totalCalls} All-Time`, icon: PhoneCall, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Conversions", value: stats.interested, icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Avg Duration", value: stats.avgDuration, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Conv. Rate", value: stats.conversionRate, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
  ] : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Deep dive into campaign performance and AI metrics.</p>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(({ label, value, subValue, icon: Icon, color, bg }) => (
            <div key={label} className="crm-card p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{value ?? "—"}</p>
                {subValue && <span className="text-xs font-medium text-slate-400 tabular-nums">{subValue}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 crm-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Call Volume & Conversions</h2>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gCalls)" />
                <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="w-3 h-0.5 bg-blue-500 rounded-full" /> Total Calls
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="w-3 h-0.5 bg-emerald-500 rounded-full" /> Conversions
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="crm-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieIcon className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Outcome Breakdown</h2>
          </div>
          {pieData.some(d => d.value > 0) ? (
            <>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {pieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <PieIcon className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="crm-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">Lead Score Distribution</h2>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversions" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

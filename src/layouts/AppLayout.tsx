import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  BarChart3,
  Calendar,
  BrainCircuit,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  Zap,
  Radio,
  Sparkles,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { NexusProvider } from "../context/NexusContext";
import NexusAI from "../components/Nexus/NexusAI";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, section: "main" },
  { name: "Campaigns", path: "/campaigns", icon: Zap, section: "main" },
  { name: "Leads", path: "/leads", icon: Users, section: "main" },
  { name: "Live Monitor", path: "/live", icon: Radio, section: "main" },
  { name: "Analytics", path: "/analytics", icon: TrendingUp, section: "insights" },
  { name: "Calendar", path: "/calendar", icon: Calendar, section: "insights" },
  { name: "Settings", path: "/settings", icon: Settings, section: "system" },
];

export default function AppLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = navItems.find((n) => n.path === location.pathname)?.name || "Dashboard";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <BrainCircuit className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-white font-bold text-[15px] leading-tight">AI Telecaller</p>
              <p className="text-slate-500 text-[10px] font-medium tracking-wider uppercase">CRM Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-800/80" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Main */}
        {!sidebarCollapsed && (
          <p className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Main</p>
        )}
        {navItems.filter(n => n.section === "main").map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100" />
                )}
                <item.icon className="nav-icon relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}

        <div className="py-2" />

        {/* Insights */}
        {!sidebarCollapsed && (
          <p className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Insights</p>
        )}
        {navItems.filter(n => n.section === "insights").map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100" />
                )}
                <item.icon className="nav-icon relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}

        <div className="py-2" />

        {/* System */}
        {!sidebarCollapsed && (
          <p className="px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">System</p>
        )}
        {navItems.filter(n => n.section === "system").map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100" />
                )}
                <item.icon className="nav-icon relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all duration-200 text-sm"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          {!sidebarCollapsed && <span className="text-xs">Collapse sidebar</span>}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-800/80" />

      {/* User profile */}
      <div className="p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
            AX
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@telecaller.ai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <NexusProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:flex flex-col h-full bg-[#0c1220] border-r border-slate-800/80 transition-all duration-300 shrink-0 ${
            sidebarCollapsed ? "w-16" : "w-60"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Sidebar - Mobile */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-[#0c1220] border-r border-slate-800/80 transition-transform duration-300 lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          {/* Topbar */}
          <header className="h-16 bg-white dark:bg-[#0f1723] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 dark:text-slate-500 hidden sm:block">Platform</span>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:block">/</span>
                <span className="font-semibold text-slate-800 dark:text-white">{currentPage}</span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads, campaigns, calls..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-700/50 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-400 text-[10px] rounded-md font-mono">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">System Live</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f1723]" />
              </button>

              {/* Nexus AI quick button */}
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-md shadow-blue-500/25">
                <Sparkles className="w-3.5 h-3.5" />
                Nexus AI
              </button>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0c1220]">
            <div className="p-4 lg:p-6 h-full">
              <Outlet />
            </div>
          </div>
        </div>

        <NexusAI />
      </div>
    </NexusProvider>
  );
}

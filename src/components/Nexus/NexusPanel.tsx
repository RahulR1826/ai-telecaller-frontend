import React from "react";
import { X, BrainCircuit, Activity } from "lucide-react";
import { useNexus } from "../../context/NexusContext";
import NexusChat from "./NexusChat";

export default function NexusPanel() {
  const { isNexusOpen, setNexusOpen } = useNexus();

  if (!isNexusOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Nexus AI
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Sales Operations Assistant • Groq Llama-3.3</p>
          </div>
        </div>
        <button
          onClick={() => setNexusOpen(false)}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live Mode Indicator */}
      {/* TODO: Connect to actual live call state */}
      <div className="hidden bg-blue-50 dark:bg-blue-900/20 px-4 py-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 border-b border-blue-100 dark:border-blue-900/50">
        <Activity className="w-3.5 h-3.5 animate-pulse" />
        <span>Live Assistant Mode Active</span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <NexusChat />
      </div>
    </div>
  );
}

import React from "react";
import { BrainCircuit } from "lucide-react";
import { useNexus } from "../../context/NexusContext";

export default function NexusFloatingButton() {
  const { toggleNexus, isNexusOpen } = useNexus();

  if (isNexusOpen) return null;

  return (
    <button
      onClick={toggleNexus}
      className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group"
    >
      <BrainCircuit className="w-6 h-6 animate-pulse group-hover:animate-none" />
      <span className="absolute -top-10 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Nexus AI (Ctrl+K)
      </span>
    </button>
  );
}

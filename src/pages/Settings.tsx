import React from "react";
import { Phone, BrainCircuit, Mic, Key, Save, Shield, Cpu } from "lucide-react";

const Section = ({ icon: Icon, iconColor, title, children }: any) => (
  <div className="crm-card overflow-hidden">
    <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <h2 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h2>
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all";

export default function Settings() {
  return (
    <div className="space-y-5 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure integrations and preferences.</p>
        </div>
        <button className="btn-primary shrink-0">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl space-y-5">
          {/* Twilio */}
          <Section icon={Phone} iconColor="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Twilio Configuration">
            <Field label="Account SID">
              <input type="text" className={inputCls} defaultValue="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </Field>
            <Field label="Auth Token">
              <div className="relative">
                <input type="password" className={inputCls} defaultValue="••••••••••••••••••••••••••••••••" />
                <Key className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
            <Field label="Phone Number">
              <input type="text" className={inputCls} defaultValue="+1xxxxxxxxxx" />
            </Field>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Twilio connected and active
            </div>
          </Section>

          {/* AI Provider */}
          <Section icon={BrainCircuit} iconColor="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" title="AI Provider — Groq">
            <Field label="Groq API Key">
              <div className="relative">
                <input type="password" className={inputCls} defaultValue="gsk_••••••••••••••••" />
                <Shield className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
            <Field label="LLM Model">
              <select className={inputCls}>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Max Tokens", value: "2048" },
                { label: "Temperature", value: "0.7" },
              ].map(({ label, value }) => (
                <Field key={label} label={label}>
                  <input type="text" className={inputCls} defaultValue={value} />
                </Field>
              ))}
            </div>
          </Section>

          {/* Voice / TTS */}
          <Section icon={Mic} iconColor="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Text-to-Speech (TTS)">
            <Field label="Voice Engine">
              <select className={inputCls}>
                <option value="amazon-polly">Amazon Polly (Matthew)</option>
                <option value="elevenlabs">ElevenLabs</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Speaking Rate", value: "1.0" },
                { label: "Pitch", value: "0" },
              ].map(({ label, value }) => (
                <Field key={label} label={label}>
                  <input type="text" className={inputCls} defaultValue={value} />
                </Field>
              ))}
            </div>
          </Section>

          {/* System */}
          <Section icon={Cpu} iconColor="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" title="System Preferences">
            <div className="space-y-3">
              {[
                { label: "Auto-pause campaign on high failure rate", defaultChecked: true },
                { label: "Send email summaries after each campaign", defaultChecked: false },
                { label: "Enable real-time WebSocket monitoring", defaultChecked: true },
              ].map(({ label, defaultChecked }) => (
                <label key={label} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-blue-600 rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

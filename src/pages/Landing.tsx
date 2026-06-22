import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ArrowRight, Mic, Users, BarChart3, ShieldCheck, Zap, Globe, CheckCircle } from "lucide-react";

const features = [
  { icon: Mic, color: "from-blue-500 to-blue-600", title: "Ultra-Realistic Voice AI", desc: "Powered by state-of-the-art TTS and LLM integration, our agents sound completely natural and handle complex conversations." },
  { icon: Users, color: "from-indigo-500 to-purple-600", title: "Smart Lead Management", desc: "Import CSVs, segment campaigns, and let the AI instantly qualify prospects, booking them into your calendar." },
  { icon: BarChart3, color: "from-emerald-500 to-teal-600", title: "Real-time Analytics", desc: "Watch calls happen live. Get full transcripts, automated call summaries, and deep conversion insights." },
  { icon: Zap, color: "from-amber-500 to-orange-600", title: "Campaign Automation", desc: "Set up multi-step calling pipelines with start, pause, and resume controls. Scale without hiring." },
  { icon: Globe, color: "from-rose-500 to-pink-600", title: "CRM Integration", desc: "All leads, callbacks, and demos sync directly to your existing workflow with full audit trails." },
  { icon: ShieldCheck, color: "from-cyan-500 to-blue-600", title: "Enterprise Security", desc: "End-to-end encrypted calls with GDPR-compliant data handling and role-based access controls." },
];

const steps = [
  { n: "01", title: "Create Campaign", desc: "Define your business, product, offer, and upload a CSV of prospects." },
  { n: "02", title: "Launch AI Calls", desc: "The AI agent calls each lead with a personalized, natural conversation." },
  { n: "03", title: "Qualify & Convert", desc: "Hot leads are scored, callbacks booked, and demos scheduled automatically." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#080d17] text-slate-900 dark:text-slate-50 font-sans overflow-x-hidden">

      {/* Navbar */}
      <header className="sticky top-0 z-50 glass dark:bg-[#080d17]/80 border-b border-slate-200 dark:border-slate-800/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">AI Telecaller</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link>
            <Link to="/dashboard" className="btn-primary text-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-24 overflow-hidden hero-grid">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-500/15 via-indigo-500/8 to-transparent rounded-full pointer-events-none" />
        <div className="absolute top-32 right-0 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8 border border-blue-200 dark:border-blue-800/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Meet the world's smartest AI Sales Agent
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.05]">
            Automate your outreach.
            <br />
            <span className="gradient-text">Close more deals.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI Telecaller automates your entire outbound sales pipeline using human-like voice AI — qualifying leads, booking demos, and updating your CRM in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              View Live Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            {["No credit card required", "14-day free trial", "SOC 2 compliant"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">Enterprise-grade capabilities</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to scale your sales ops without hiring more staff.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="feature-card group">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Launch your first AI campaign in under 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-800" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-black shadow-xl shadow-blue-500/25 mb-5">
                  {n}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to supercharge your sales?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of modern sales teams automating their outbound with AI Telecaller.
          </p>
          <Link to="/dashboard" className="inline-flex items-center gap-2.5 px-10 py-5 bg-white text-blue-700 hover:bg-blue-50 font-black rounded-2xl transition-all shadow-2xl hover:-translate-y-0.5">
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-blue-200 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> No credit card required · 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#080d17] py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 dark:text-white">AI Telecaller</span>
          </div>
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} AI Telecaller Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

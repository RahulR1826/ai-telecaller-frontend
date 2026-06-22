import React, { useEffect, useState } from "react";
import { Plus, Play, Pause, Square, Target, X, Pencil, Trash2, UploadCloud, Zap, ChevronRight, Search } from "lucide-react";
import { getCampaigns, createCampaign, pauseCampaign, resumeCampaign, stopCampaign, editCampaign, deleteCampaign } from "../services/api";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Active: "badge-active",
    Paused: "badge-paused",
    Completed: "badge-completed",
    Draft: "badge-draft",
    draft: "badge-draft",
    Idle: "badge-completed",
  };
  return (
    <span className={`badge ${map[status] || "badge-draft"}`}>
      {status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {status}
    </span>
  );
};

const FieldRow = ({ label, children }: any) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const loadCampaigns = () => {
    getCampaigns().then((data) => {
      if (Array.isArray(data)) {
        setCampaigns(data.map(c => ({
          id: c.id,
          name: c.name || "Untitled Campaign",
          business: c.businessName || "Unknown",
          product: c.product || "Unknown",
          objective: c.objective || "Unknown",
          uploaded: c.queueUploaded !== undefined ? c.queueUploaded : (c.contacts?.length || 0),
          completed: c.queueCompleted !== undefined ? c.queueCompleted : (c.contacts?.filter((cont: any) => cont.status !== "pending").length || 0),
          conversion: c.conversion || 0,
          status: c.status || "Draft"
        })));
      }
    });
  };

  useEffect(() => {
    loadCampaigns();
    const interval = setInterval(loadCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: "", business_name: "", product: "", offer: "", objective: "", admin_name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", business_name: "", product: "", offer: "", objective: "" });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await createCampaign(formData);
      if (csvFile && created?.id) {
        const text = await csvFile.text();
        const rows = text.split('\n');
        const phones: string[] = [];
        rows.forEach(row => {
          const cols = row.split(',');
          for (const col of cols) {
            const val = col.trim();
            const digits = val.replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 15) { phones.push(val); break; }
          }
        });
        if (phones.length > 0) {
          import("../services/api").then(({ uploadContacts }) => {
            uploadContacts(created.id, phones).then(() => loadCampaigns());
          });
        }
      }
      setIsModalOpen(false);
      setFormData({ name: "", business_name: "", product: "", offer: "", objective: "", admin_name: "" });
      setCsvFile(null);
      loadCampaigns();
    } catch { alert("Failed to create campaign. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  const handleAction = async (id: string, action: "start" | "resume" | "pause" | "stop") => {
    try {
      if (action === "start") { const { startCampaign } = await import("../services/api"); await startCampaign(id); }
      if (action === "resume") await resumeCampaign(id);
      if (action === "pause") await pauseCampaign(id);
      if (action === "stop") await stopCampaign(id);
      setCampaigns(prev => prev.map(c => {
        if (c.id !== id) return c;
        const nextStatus = (action === "resume" || action === "start") ? "Active" : action === "pause" ? "Paused" : "Completed";
        return { ...c, status: nextStatus };
      }));
      loadCampaigns();
    } catch (err: any) {
      alert(`Failed to ${action} campaign: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEditOpen = (camp: any) => {
    setEditingCampaign(camp);
    setEditForm({ name: camp.name, business_name: camp.business || "", product: camp.product || "", offer: "", objective: camp.objective || "" });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    setIsEditSubmitting(true);
    try { await editCampaign(editingCampaign.id, editForm); setEditingCampaign(null); loadCampaigns(); }
    catch { alert("Failed to update campaign."); }
    finally { setIsEditSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCampaign(id); setDeleteConfirm(null); loadCampaigns(); }
    catch { alert("Failed to delete campaign."); }
  };

  const handleFileUploadForExisting = async (e: React.ChangeEvent<HTMLInputElement>, campaignId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) { alert("CSV is empty."); return; }
      const headerLine = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
      const phoneColIdx = headerLine.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('number') || h.includes('contact'));
      const nameColIdx = headerLine.findIndex(h => h.includes('name') || h.includes('customer') || h.includes('contact'));
      const contacts: { phone: string; name: string | null }[] = [];
      const dataRows = phoneColIdx >= 0 ? lines.slice(1) : lines;
      dataRows.forEach(row => {
        const cols = row.split(',');
        let phone: string | null = null;
        let name: string | null = null;
        if (phoneColIdx >= 0 && cols[phoneColIdx]) {
          const digits = cols[phoneColIdx].trim().replace(/\D/g, '');
          if (digits.length >= 10 && digits.length <= 15) phone = cols[phoneColIdx].trim();
        } else {
          for (const col of cols) { const digits = col.trim().replace(/\D/g, ''); if (digits.length >= 10 && digits.length <= 15) { phone = col.trim(); break; } }
        }
        if (nameColIdx >= 0 && cols[nameColIdx]) { const n = cols[nameColIdx].trim().replace(/^"|"$/g, ''); if (n && !/^\d+$/.test(n)) name = n; }
        if (phone) contacts.push({ phone, name });
      });
      if (contacts.length > 0) {
        import("../services/api").then(({ uploadContacts }) => {
          uploadContacts(campaignId, contacts as any).then(() => loadCampaigns());
        });
        alert(`Uploaded ${contacts.length} contacts successfully.`);
      } else { alert("No valid phone numbers found in CSV."); }
    } catch { alert("Failed to parse CSV."); }
    e.target.value = '';
  };

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.business.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "crm-input";
  const modalInputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="space-y-5 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Campaigns</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your automated AI calling pipelines.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Search & Stats bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: "All", count: campaigns.length, color: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800" },
            { label: "Active", count: campaigns.filter(c => c.status === "Active").length, color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "Draft", count: campaigns.filter(c => c.status === "Draft" || c.status === "draft").length, color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" },
          ].map(({ label, count, color }) => (
            <span key={label} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
              {label}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-2">
        {filtered.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center h-52 text-slate-400 crm-card">
            <Zap className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-semibold">No campaigns found</p>
            <p className="text-sm mt-1 opacity-60">Create a campaign to get started</p>
          </div>
        ) : filtered.map((camp) => {
          const pct = camp.uploaded > 0 ? Math.round((camp.completed / camp.uploaded) * 100) : 0;
          return (
            <div key={camp.id} className="campaign-card">
              {/* Card Header */}
              <div className="campaign-card-header flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate leading-tight">{camp.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                    <Target className="w-3 h-3 shrink-0" /> {camp.objective}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <label className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer" title="Upload contacts CSV">
                    <UploadCloud className="w-4 h-4" />
                    <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUploadForExisting(e, camp.id)} />
                  </label>
                  <button onClick={() => handleEditOpen(camp)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors" title="Edit campaign">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(camp.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors" title="Delete campaign">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <StatusBadge status={camp.status} />
                </div>
              </div>

              {/* Card Body */}
              <div className="campaign-card-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{camp.product}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conversion</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{camp.conversion}%</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">{camp.completed} / {camp.uploaded} · {pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="campaign-card-footer">
                {camp.status === "Draft" || camp.status === "draft" || camp.status === "Completed" || camp.status === "Idle" ? (
                  <button onClick={() => handleAction(camp.id, "start")} className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                ) : (
                  <button onClick={() => handleAction(camp.id, "resume")} disabled={camp.status === "Active" || camp.status === "Completed"} className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40">
                    <Play className="w-3.5 h-3.5 text-emerald-500" /> Resume
                  </button>
                )}
                <button onClick={() => handleAction(camp.id, "pause")} disabled={camp.status !== "Active"} className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-200 transition-colors disabled:opacity-40">
                  <Pause className="w-3.5 h-3.5 text-amber-500" /> Pause
                </button>
                <button onClick={() => handleAction(camp.id, "stop")} disabled={camp.status === "Completed" || camp.status === "Draft" || camp.status === "draft"} className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 hover:border-rose-200 transition-colors disabled:opacity-40">
                  <Square className="w-3.5 h-3.5 text-rose-500" /> Stop
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Campaign</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure your AI calling campaign</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <FieldRow label="Campaign Name">
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={modalInputCls} placeholder="e.g. Q3 Software Lead Gen" />
              </FieldRow>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Business Name">
                  <input required type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className={modalInputCls} placeholder="Your Company" />
                </FieldRow>
                <FieldRow label="Admin Name">
                  <input required type="text" value={formData.admin_name} onChange={e => setFormData({...formData, admin_name: e.target.value})} className={modalInputCls} placeholder="John Doe" />
                </FieldRow>
              </div>
              <FieldRow label="Product / Service">
                <input required type="text" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className={modalInputCls} placeholder="What are you selling?" />
              </FieldRow>
              <FieldRow label="Offer / Value Proposition">
                <textarea required value={formData.offer} onChange={e => setFormData({...formData, offer: e.target.value})} className={`${modalInputCls} resize-none h-20`} placeholder="e.g. Free 14-day trial with no credit card required." />
              </FieldRow>
              <FieldRow label="Campaign Objective">
                <input required type="text" value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} className={modalInputCls} placeholder="e.g. Book a discovery call" />
              </FieldRow>
              <FieldRow label="Upload Contacts (CSV)">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors mb-1" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {csvFile ? <span className="text-blue-600 dark:text-blue-400">{csvFile.name}</span> : "Click to upload phone numbers CSV"}
                  </p>
                  <input type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                </label>
              </FieldRow>
              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCampaign && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Campaign</h2>
              <button onClick={() => setEditingCampaign(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <FieldRow label="Campaign Name">
                <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={modalInputCls} />
              </FieldRow>
              <FieldRow label="Business Name">
                <input type="text" value={editForm.business_name} onChange={e => setEditForm({...editForm, business_name: e.target.value})} className={modalInputCls} />
              </FieldRow>
              <FieldRow label="Product / Service">
                <input type="text" value={editForm.product} onChange={e => setEditForm({...editForm, product: e.target.value})} className={modalInputCls} />
              </FieldRow>
              <FieldRow label="Offer / Value Proposition">
                <textarea value={editForm.offer} onChange={e => setEditForm({...editForm, offer: e.target.value})} className={`${modalInputCls} resize-none h-16`} />
              </FieldRow>
              <FieldRow label="Campaign Objective">
                <input type="text" value={editForm.objective} onChange={e => setEditForm({...editForm, objective: e.target.value})} className={modalInputCls} />
              </FieldRow>
              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingCampaign(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isEditSubmitting} className="btn-primary disabled:opacity-50">{isEditSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">Delete Campaign?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">This will permanently delete the campaign and its queue data. Call history is preserved.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import axios from "axios";

// Points to the local backend port 5000 or production URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCampaigns = async () => {
  try {
    const res = await api.get("/campaign");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch campaigns", error);
    return [];
  }
};

export const createCampaign = async (data: any) => {
  try {
    const res = await api.post("/campaign", data);
    return res.data;
  } catch (error) {
    console.error("Failed to create campaign", error);
    throw error;
  }
};

export const uploadContacts = async (campaignId: string, phoneNumbers: string[]) => {
  try {
    const res = await api.post(`/campaign/${campaignId}/upload`, { phoneNumbers });
    return res.data;
  } catch (error) {
    console.error("Failed to upload contacts", error);
    throw error;
  }
};

export const startCampaign = async (campaignId: string) => {
  try {
    const res = await api.post(`/campaign/${campaignId}/start`);
    return res.data;
  } catch (error) {
    console.error("Failed to start campaign", error);
    throw error;
  }
};

export const pauseCampaign = async (campaignId: string) => {
  try {
    const res = await api.post(`/campaign/${campaignId}/pause`);
    return res.data;
  } catch (error) {
    console.error("Failed to pause campaign", error);
    throw error;
  }
};

export const resumeCampaign = async (campaignId: string) => {
  try {
    const res = await api.post(`/campaign/${campaignId}/resume`);
    return res.data;
  } catch (error) {
    console.error("Failed to resume campaign", error);
    throw error;
  }
};

export const stopCampaign = async (campaignId: string) => {
  try {
    const res = await api.post(`/campaign/${campaignId}/stop`);
    return res.data;
  } catch (error) {
    console.error("Failed to stop campaign", error);
    throw error;
  }
};

export const editCampaign = async (campaignId: string, data: any) => {
  try {
    const res = await api.put(`/campaign/${campaignId}`, data);
    return res.data;
  } catch (error) {
    console.error("Failed to edit campaign", error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId: string) => {
  try {
    const res = await api.delete(`/campaign/${campaignId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete campaign", error);
    throw error;
  }
};

import { Lead } from "../types";

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const res = await api.get("/lead");
    return res.data.map((lead: any) => ({
      id: lead.id,
      name: lead.name || lead.phone || "Unknown",
      phone: lead.phone || "Unknown",
      company: lead.company || lead.campaign?.name || "-",
      campaign: lead.campaign?.name || "Unknown Campaign",
      leadScore: lead.leadScore || 0,
      status: lead.status || "new",
      lastCall: lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : "-",
      nextFollowUp: lead.callbackTime || lead.nextAction || "-",
      assignedAgent: "AI Agent",
      notes: lead.notes || "",
    }));
  } catch (err) {
    console.error("Failed to fetch leads", err);
    return [];
  }
};

export const getDashboardStats = async () => {
  try {
    const res = await api.get("/analytics");
    const data = res.data;
    
    const minutes = Math.floor(data.avgDurationSec / 60);
    const seconds = data.avgDurationSec % 60;
    
    return {
      todayCalls: data.todayCalls || 0,
      totalCalls: data.totalCalls || 0,
      completed: (data.todayCalls || 0) - (data.liveCount || 0),
      active: data.liveCount || 0,
      interested: data.conversions || 0,
      callbacks: data.sentiment?.positive || 0,
      conversionRate: `${data.conversionRate || 0}%`,
      avgDuration: `${minutes}m ${seconds}s`,
      avgLeadScore: Math.round(data.conversionRate) || 0
    };
  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
    return {
      todayCalls: 0,
      totalCalls: 0,
      completed: 0,
      active: 0,
      interested: 0,
      callbacks: 0,
      conversionRate: "0%",
      avgDuration: "0m 0s",
      avgLeadScore: 0
    };
  }
};

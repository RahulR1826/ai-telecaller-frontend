export interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string;
  campaign: string;
  leadScore: number;
  status: "Interested" | "Warm" | "Cold" | "Not Interested" | "Callback" | "Converted" | "New";
  lastCall: string;
  nextFollowUp: string | null;
  assignedAgent: string;
}

export interface Campaign {
  id: string;
  name: string;
  business: string;
  product: string;
  offer: string;
  objective: string;
  callsCompleted: number;
  callsRemaining: number;
  conversionRate: number;
  status: "Active" | "Paused" | "Completed" | "Draft";
}

export interface LiveCallState {
  callSid: string;
  customerName: string;
  phoneNumber: string;
  duration: number;
  status: "Ringing" | "In Progress" | "Completed" | "Failed";
  stage: string;
  aiSpeaking: boolean;
  customerSpeaking: boolean;
  transcript: { speaker: "ai" | "customer"; text: string }[];
  liveSentiment: "Positive" | "Neutral" | "Negative";
  leadScore: number;
}

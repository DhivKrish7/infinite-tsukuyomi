import type { ClientRecord, LeadRecord, TaskRecord } from "./types";

export const demoClients: ClientRecord[] = [
  {
    id: "demo-client-1",
    name: "Marcus Reid",
    email: "marcus@email.com",
    phone: "+44 7700 900123",
    country: "United Kingdom",
    status: "ACTIVE",
    onboardingStage: "ACTIVE_TRADER",
    kycStatus: "VERIFIED",
    riskLevel: "LOW",
    nextFollowUpAt: new Date(Date.now() + 86400000).toISOString(),
    assignedTo: { id: "agent-1", name: "Nexus Admin" },
    tags: [{ id: "tag-vip", name: "VIP", color: "#a78bfa" }],
    _count: { notes: 4, communications: 9, tasks: 1, accounts: 2 }
  },
  {
    id: "demo-client-2",
    name: "Chloe Martin",
    email: "chloe@email.com",
    phone: "+33 612 345 678",
    country: "France",
    status: "SUSPENDED",
    onboardingStage: "KYC_REVIEW",
    kycStatus: "FLAGGED",
    riskLevel: "HIGH",
    assignedTo: { id: "agent-2", name: "Compliance Desk" },
    tags: [{ id: "tag-review", name: "AML Review", color: "#ff4d6a" }],
    _count: { notes: 7, communications: 5, tasks: 3, accounts: 1 }
  }
];

export const demoLeads: LeadRecord[] = [
  {
    id: "demo-lead-1",
    name: "James Okafor",
    email: "james@email.com",
    phone: "+234 801 234 5678",
    country: "Nigeria",
    source: "NebulFX Landing",
    campaign: "Gold Webinar",
    status: "QUALIFIED",
    onboardingStage: "APPLICATION_STARTED",
    score: 82,
    assignedTo: { id: "agent-1", name: "Nexus Admin" },
    tags: [{ id: "tag-hot", name: "Hot", color: "#00e5a0" }],
    _count: { notes: 2, communications: 4, tasks: 1 }
  },
  {
    id: "demo-lead-2",
    name: "Nadia Muller",
    email: "nadia@email.com",
    source: "Affiliate",
    campaign: "IB-DE-42",
    status: "CONTACTED",
    onboardingStage: "CONTACTED",
    score: 58,
    assignedTo: { id: "agent-3", name: "Sales Team" },
    tags: [{ id: "tag-ib", name: "IB Referral", color: "#00d4ff" }],
    _count: { notes: 1, communications: 2, tasks: 2 }
  }
];

export const demoTasks: TaskRecord[] = [
  {
    id: "task-1",
    title: "Call James after webinar follow-up",
    dueAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    status: "OPEN",
    priority: "HIGH",
    lead: { id: "demo-lead-1", name: "James Okafor" },
    assignedTo: { id: "agent-1", name: "Nexus Admin" }
  },
  {
    id: "task-2",
    title: "Review Chloe AML escalation",
    dueAt: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: "IN_PROGRESS",
    priority: "URGENT",
    client: { id: "demo-client-2", name: "Chloe Martin" },
    assignedTo: { id: "agent-2", name: "Compliance Desk" }
  }
];

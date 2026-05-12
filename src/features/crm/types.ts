export type CrmTag = {
  id: string;
  name: string;
  color: string;
};

export type AssignedUser = {
  id: string;
  name: string;
  email?: string;
};

export type ClientRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  status: string;
  onboardingStage: string;
  kycStatus: string;
  riskLevel: string;
  nextFollowUpAt?: string | null;
  assignedTo?: AssignedUser | null;
  tags: CrmTag[];
  _count?: {
    notes: number;
    communications: number;
    tasks: number;
    accounts?: number;
  };
};

export type LeadRecord = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  source?: string | null;
  campaign?: string | null;
  status: string;
  onboardingStage: string;
  score: number;
  nextFollowUpAt?: string | null;
  assignedTo?: AssignedUser | null;
  tags: CrmTag[];
  _count?: {
    notes: number;
    communications: number;
    tasks: number;
  };
};

export type TaskRecord = {
  id: string;
  title: string;
  dueAt: string;
  status: string;
  priority: string;
  client?: { id: string; name: string } | null;
  lead?: { id: string; name: string } | null;
  assignedTo?: AssignedUser | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
};

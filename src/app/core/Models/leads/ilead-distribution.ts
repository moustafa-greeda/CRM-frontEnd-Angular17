export interface ILeadDistribution {
  id: number;
  name: string;
  jobTitle: string | null;
  email: string | null;
  phone: string;
  companyName: string | null;
  campaignName: string | null;
  leadSourceName: string | null;
  leadStatusName: string | null;
  assignedTo: string | null;
  createdAt: string;
}

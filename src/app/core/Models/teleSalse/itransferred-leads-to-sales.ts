export interface ITransferredLeadsData {
  totalTransferredToSales: number;
  transferredLeads: ITransferredLead[];
}

export interface ITransferredLead {
  id?: number;
  leadId?: number;
  salesId?: number;
  assignedBy?: string;
  assignedAt?: string;
  employeeName: string;
  leadName: string;
  leadStatus: string;
}

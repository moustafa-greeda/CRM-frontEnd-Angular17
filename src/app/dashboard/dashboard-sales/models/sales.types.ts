export type PacketOption = {
  id: number | null;
  name: string;
  price?: number | null;
};

export interface SalesStats {
  title: string;
  count: number | string;
  icon: string;
}

export interface SalesLead {
  id?: number;
  leadId?: number;
  assignmentId?: number;
  contactName: string;
  assignDate: string;
  assigndate?: string;
  leadStatus: string;
  country: string;
  city: string;
  budget: number;
  currencyName: string;
  lastActionTime: string;
  actionNote: string;
  packet?: PacketOption | null;
  packetId?: number | null;
  packetName?: string;
  packetPrice?: number | null;
  productPrice?: number | null;
  _originalLeadStatus?: string;
  _draftLeadStatus?: string;
  _originalAssignLeadId?: number;
  _draftAssignLeadId?: number;
}

export interface ActionTypeConfig {
  name: string;
  icon: string;
  label: string;
  placeholder: string;
  type: string;
}

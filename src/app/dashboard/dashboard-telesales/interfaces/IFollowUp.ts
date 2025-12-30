export interface IFollowUp {
  contactId?: number;
  contactName: string;
  actionId: number;
  actionTime: string;
  actionType: string;
  actionText: string;
  actionStatues: string;
  assignedBy?: string;
  pageSize?: number;
  pageIndex?: number;
  searchKeyword?: any;
}

export interface IFollowUpPersonal {
  clientId?: number;
  clientName: string;
  gender: string;
  phoneNumber: number;
  emailAddress: string;
  language: string;
  age: number;
  city: string;
  country: string;
  lastupdate: string;
  companyName: string;
  companyEmail: string;
  leadSource: string;
}

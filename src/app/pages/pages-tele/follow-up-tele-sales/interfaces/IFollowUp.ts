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

// ==================================== component ReportAiComponent ===========================================
export interface IReportAiForLead {
  data: {
    client: {
      clientId: number;
      clientName: string;
      gender: string;
      phoneNumber: string;
      emailAddress?: string | null;
      language: string;
      age: number;
      city: string;
      country: string;
      lastupdate: string;
      companyName: string;
      companyEmail: string;
      leadSource: string;
    };
    aiInsight: {
      leadType: string;
      dataQuality: string;
      conversionProbability: string;
      riskLevel: string;
      summary: string;
      missingData: [];
      recommendedActions: [];
      telesalesAdvice: [
        {
          advice: string;
          objectionHandling: string;
          confidenceScore: number;
        }
      ];
      callScript: string;
      whatsAppFollowUp: string;
      engagementTips: string[];
      followUpRecommendation: string;
      urgencyLevel: string;
    };
  };
}

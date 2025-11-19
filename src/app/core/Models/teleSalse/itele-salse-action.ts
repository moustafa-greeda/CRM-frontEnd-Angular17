export interface ITeleSalseAction {
  id: number;
  leadId: number;
  employeeId: number;
  actionTypeId: number;
  actionTypeName: string;
  actionDate: string;
  createdAt: string;
  updatedAt: string;
  actionNotes?: string;
}

export interface ITeleSalseActionRequest {
  leadId: number;
  actionTypeId: number;
  actionNotes: string;
}

export interface ITeleSalseActionGroup {
  actionTypeId: number;
  actionTypeName: string;
  actionNotes: string;
  total: number;
  actions: ITeleSalseAction[];
}

export interface ITeleSalseActionResponse {
  succeeded: boolean;
  data: {
    employeeId: number;
    startUtc: string;
    endUtc: string;
    totalActionGroups: number;
    actionsGrouped: ITeleSalseActionGroup[];
  };
  warningErrors: null;
  validationErrors: any[];
}

export interface IRecentInteraction {
  contactName: string;
  actionId: number;
  actionTime: string;
  actionType: string;
  actionText: string;
}

export interface IRecentInteractionsResponse {
  succeeded: boolean;
  data: IRecentInteraction[];
  warningErrors: null;
  validationErrors: any[];
}

/**------------ Dashboard statistics data structure ------------**/
export interface DashboardStat {
  title: string;
  count: number;
  icon: string;
}

/**
 * Filter state interface
 */
export interface FilterState {
  searchTerm: string;
  selectedLeadStatusId: number;
  selectedCountry: string;
  selectedCity: string;
  selectedActionDateFilter: string;
  pageSize: number;
  currentPage: number;
}

/**
 * Lead data structure
 */
export interface Lead {
  contactName: string;
  assigndate: string;
  leadStatus: string;
  country?: string;
  city: string;
  lastActionTime: string;
  actionNote: string;
}

/**
 * Column configuration for table
 */
export interface TableColumn {
  key: string;
  header: string;
  formatter?: 'date' | 'datetime';
  width?: string;
}

/**
 * Action types for lead interactions
 */
export enum ActionType {
  Call = 1,
  Email = 2,
  Meeting = 3,
  Notes = 4,
  FollowUp = 5,
}

/**
 * Configuration for action dialogs
 */
export interface ActionDialogConfig {
  name: string;
  icon: string;
  label: string;
  placeholder: string;
  type: string;
}

/**
 * Action type ID mapping
 */
export type ActionTypeConfig = {
  [key in ActionType]: ActionDialogConfig;
};

/**
 * Notification interface
 */
export interface Notification {
  id: number;
  type: string;
  typeText: string;
  message: string;
  time: string;
  isRead: boolean;
  title: string;
  createdAt: string;
}

/**
 * Recent interaction interface
 */
export interface RecentInteraction {
  actionType: string;
  actionTime: string;
  contactName: string;
  actionText: string;
}

export interface EditLeadStatusRequest {
  leadId: number;
  assignLeadId?: number;
  leadStatus: string;
}

export interface AssignLeadsToSalesRequest {
  leadId: number;
  salesId: number;
  notes: string;
  currencyId: number;
  buddgetValue: number;
}

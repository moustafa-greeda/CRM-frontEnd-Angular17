export interface INotification {
  id: number;
  userId: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  createdBy: string;
  isRead: boolean;
  data: {
    UserId: string;
    UserName: string;
  };
}

export interface INotificationResponse {
  succeeded: boolean;
  data: {
    totalCount: number;
    items: INotification[];
  };
  warningErrors: null;
  validationErrors: any[];
}

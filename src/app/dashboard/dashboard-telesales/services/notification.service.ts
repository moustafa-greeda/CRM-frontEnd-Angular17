import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationUtilsService {
  getNotificationTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      login: 'تسجيل الدخول',
      reminder: 'تذكير',
      warning: 'تحذير',
      info: 'معلومة',
      assignment: 'تعيين',
      status_change: 'تغيير الحالة',
    };
    return typeMap[type] || 'تنبيه';
  }

  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      reminder: 'bi-info-circle',
      warning: 'bi-exclamation-triangle',
      info: 'bi-info-circle',
    };
    return iconMap[type] || 'bi-info-circle';
  }

  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'الآن';
    } else if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else if (days < 7) {
      return `منذ ${days} يوم`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  }
}

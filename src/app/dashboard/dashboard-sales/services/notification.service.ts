import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SalesNotificationService {
  getNotificationTypeText(type: string): string {
    switch (type) {
      case 'login':
        return 'تسجيل الدخول';
      case 'reminder':
        return 'تذكير';
      case 'warning':
        return 'تحذير';
      case 'info':
        return 'معلومة';
      case 'assignment':
        return 'تعيين';
      case 'status_change':
        return 'تغيير الحالة';
      default:
        return 'تنبيه';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'reminder':
        return 'bi-info-circle';
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'info':
        return 'bi-info-circle';
      default:
        return 'bi-info-circle';
    }
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

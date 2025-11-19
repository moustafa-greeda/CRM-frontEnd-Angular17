import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationCardComponent {
  @Input() notifications: any[] = [];
  @Input() loadingNotifications: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  getNotificationIcon(type: string): string {
    const iconMap = {
      reminder: 'bi-info-circle',
      warning: 'bi-exclamation-triangle',
      info: 'bi-info-circle',
      login: 'bi-person-check',
    };
    return iconMap[type as keyof typeof iconMap] || 'bi-info-circle';
  }

  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-EG');
  }
}

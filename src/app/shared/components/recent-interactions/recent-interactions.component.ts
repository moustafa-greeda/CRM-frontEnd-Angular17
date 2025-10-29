import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-recent-interactions',
  templateUrl: './recent-interactions.component.html',
  styleUrls: ['./recent-interactions.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RecentInteractionsComponent implements OnInit {
  @Input() recentInteractions: any[] = [];
  @Input() loadingRecentInteractions: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  formatActionDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // difference in minutes
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (diff < 1) return 'الآن';
    if (diff < 60) return `منذ ${diff} دقيقة`;
    if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
    return `${dateStr} ${timeStr}`;
  }

  getActionTypeIcon(actionType: string): string {
    // Define action type icons based on type
    const icons: Record<string, string> = {
      Call: 'bi-telephone',
      Email: 'bi-envelope',
      Meeting: 'bi-camera-video',
      Notes: 'bi-file-earmark-text',
      FollowUp: 'bi-arrow-repeat',
    };
    return icons[actionType] || 'bi-circle';
  }
}

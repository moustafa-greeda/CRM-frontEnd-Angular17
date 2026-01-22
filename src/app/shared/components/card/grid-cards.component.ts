import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-cards',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="clients-grid-wrapper">
    <!-- حالة التحميل -->
    <div *ngIf="isLoading" class="loading-state">
      <p>جارِ التحميل...</p>
    </div>

    <!-- حالة الخطأ -->
    <div *ngIf="!isLoading && error" class="error-state">
      <p>حدث خطأ أثناء جلب البيانات 😞</p>
    </div>

    <!-- المحتوى الفعلي -->
    <div class="clients-grid" *ngIf="!isLoading && !error">
      <ng-content></ng-content>
    </div>
  </div> `,
  styles: `.clients-grid-wrapper {
  width: 100%;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  color: #fff;
  font-size: 18px;
}
`,
})
export class GridCardsComponent {
  @Input() isLoading: boolean = false;
  @Input() error: boolean = false;
}

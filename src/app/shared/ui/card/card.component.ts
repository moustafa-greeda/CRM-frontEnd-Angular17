import { Component, Input } from '@angular/core';
import { InfoBox } from '../info-boxes/info-boxes.component';

export interface CardField {
  label: string;
  key: string;
  icon?: string;
}

@Component({
  selector: 'app-card',
  template: `
    <div class="client-card border-gradient diagonal medium rounded-lg">
      <!-- Avatar -->
      <div class="client-avatar">
        <div class="icon">
          <i class="bi bi-three-dots-vertical"></i>
        </div>
        <div class="avatar-placeholder">
          {{ (data[titleKey]?.charAt(0) || '?').toUpperCase() }}
        </div>

        <div *ngIf="selectable" class="checkbox-wrapper">
          <input
            type="checkbox"
            class="custom-checkbox"
            [checked]="isSelected"
          />
        </div>
      </div>

      <!-- Info -->
      <div class="client-info">
        <div class="client-name-container">
          <h3 class="client-name">{{ data[titleKey] || 'بدون اسم' }}</h3>
          <button *ngIf="subTitleKey">
            {{ (subTitleKey ? data[subTitleKey] : '') || 'لا يوجد ' }}
          </button>
        </div>

        <!-- Fields -->
        <div class="fields-container" *ngIf="fields && fields.length > 0">
          <div class="field-item" *ngFor="let field of fields">
            <div
              class="icon-wrapper border-gradient horizontal thin rounded-full"
              *ngIf="field.icon"
            >
              <i class="{{ field.icon }}"></i>
            </div>
            <div class="field-content">
              <span class="field-label">{{ field.label }}:</span>
              <span class="field-value">{{
                data[field.key] || 'غير محدد'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Email -->
        <div class="email-container" *ngIf="data?.['email']">
          <div
            class="icon-wrapper border-gradient horizontal thin rounded-full"
          >
            <i class="bi bi-envelope"></i>
          </div>
          <p class="client-email">{{ data['email'] }}</p>
        </div>

        <!-- Info Boxes -->
        <app-info-boxes [boxes]="infoBoxes"></app-info-boxes>
      </div>

      <!-- Social & Rating -->
      <div class="client-actions">
        <div class="icon-star">
          <span>0.5</span>
          <i class="bi bi-star-fill"></i>
        </div>

        <div class="container-social">
          <div class="icon-social">
            <i class="bi bi-linkedin"></i>
          </div>
        </div>
        <div class="icon-social">
          <i class="bi bi-facebook"></i>
        </div>

        <div class="icon-social">
          <i class="bi bi-twitter-x"></i>
        </div>

        <div class="icon-social">
          <i class="bi bi-globe"></i>
        </div>

        <div class="icon-social">
          <i class="bi bi-chat-left-text"></i>
        </div>

        <div class="icon-social">
          <i class="bi bi-envelope"></i>
        </div>

        <div class="icon-social">
          <i class="bi bi-telephone-fill"></i>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .client-card {
        position: relative;
        padding: 20px;
        border-radius: 12px;
        background: rgba(17, 24, 31, 0.8);
        backdrop-filter: blur(2px);
        overflow: hidden;
        transition: all 0.3s ease;
        z-index: 0;
      }

      .client-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(255, 95, 0, 0.1);
        border-color: #ff5f00;
      }

      .client-avatar {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        background: #ff5f00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
        border: 2px solid #46e3ff;
      }

      .checkbox-wrapper {
        display: inline-block;
      }

      .client-name-container {
        display: flex;
        gap: 4px;
        flex-direction: column;
        align-items: center;
        margin-bottom: 5px;
      }

      .client-name-container button {
        font-size: 12px;
        padding: 5px 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #46e3ff;
        color: #fff;
        background: rgba(70, 227, 255, 0.24);
      }

      .client-name-container button:hover {
        background: rgba(70, 227, 255, 0.2);
        border-color: #46e3ff;
      }

      .client-info {
        margin-bottom: 16px;
        color: #fff;
      }

      .client-name {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 8px 0;
      }

      .fields-container {
        margin: 8px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0;
      }

      .field-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .field-icon i {
        font-size: 14px;
        color: #46e3ff;
      }

      .field-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .field-label {
        font-size: 11px;
        color: #ffb012;
        font-weight: 500;
      }

      .field-value {
        font-size: 12px;
        color: #ffffff;
        font-weight: 400;
      }

      .email-container,
      .phone-container {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .client-actions {
        display: flex;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #404040;
      }

      .client-actions .icon-star {
        width: 15%;
        gap: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .client-actions .icon-star span {
        color: #fff;
      }

      .client-actions .icon-star i {
        font-size: 18px;
        font-weight: 600;
        color: #ffb012;
      }

      .icon-social i {
        color: #fff;
      }
    `,
  ],
})
export class CardComponent {
  @Input() data!: Record<string, any>;
  @Input() titleKey: string = 'name';
  @Input() subTitleKey?: string;
  @Input() fields: CardField[] = [];
  @Input() infoBoxes: InfoBox[] = [];

  @Input() rating?: number;
  @Input() selectable: boolean = false;

  isSelected = false;

  toggleSelect(event: Event): void {
    this.isSelected = (event.target as HTMLInputElement).checked;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InfoBox } from '../../ui/info-boxes/info-boxes.component';

export interface CardField {
  label: string;
  key: string;
  icon?: string;
}

@Component({
  selector: 'app-card',
  template: `
    <!-- <div class="client-card border-gradient diagonal medium rounded-lg"> -->
    <div class="client-card">
      <!-- border -->
      <span class="corner tl"></span>
      <span class="corner tr"></span>
      <span class="corner bl"></span>
      <span class="corner br"></span>
      <!-- Avatar -->
      <div class="client-avatar">
        <div class="icon">
          <i class="bi bi-three-dots-vertical"></i>
        </div>
        <div class="avatar-placeholder">
          <!-- {{ (data[titleKey]?.charAt(0) || '?').toUpperCase() }} -->
          <img [src]="getAvatarImage()" [alt]="data[titleKey] || 'avatar'" />
        </div>

        <div *ngIf="selectable" class="checkbox-wrapper">
          <input
            type="checkbox"
            class="custom-checkbox"
            [checked]="isSelected"
            (change)="onSelectionChange($event)"
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
        <!-- <div class="email-container" *ngIf="data?.['email']">
          <div
            class="icon-wrapper border-gradient horizontal thin rounded-full"
          >
            <i class="bi bi-envelope"></i>
          </div>
          <p class="client-email">{{ data['email'] }}</p>
        </div> -->

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
        color: var(--white-color);
        padding: 20px;
        backdrop-filter: blur(2px);
        border-radius: 20px;
        box-shadow: inset 2px 2px 10px rgba(255, 255, 255, 0.1),
          inset -2px -2px 10px rgba(0, 0, 0, 0.6),
          0 10px 25px rgba(70, 227, 255, 0.2);
        background: var(--bg-light);
        transform: perspective(600px) rotateX(5deg) rotateY(-5deg);
        transition: 0.4s ease;
      }

      .client-card:hover {
        transform: perspective(600px) rotateX(0) rotateY(0) scale(1.05);
        box-shadow: inset 2px 2px 10px rgba(255, 255, 255, 0.1),
          inset -2px -2px 4px rgba(0, 0, 0, 0.6),
          0 4px 4px rgba(0, 234, 255, 0.4);
      }

      /* ✨ الزوايا الأربعة */
      .client-card .corner {
        position: absolute;
        width: 40px;
        height: 40px;
        pointer-events: none;
        border-radius: 12px;
        background-repeat: no-repeat;
      }

      /* 🔹 أعلى يسار */
      .client-card .corner.tl {
        top: 0;
        left: 0;
        background: linear-gradient(
              to right,
              var(--secondary-color) 4px,
              transparent 100%
            )
            top left no-repeat,
          linear-gradient(
              to bottom,
              var(--secondary-color) 4px,
              transparent 100%
            )
            top left no-repeat;
        background-size: 100% 6px, 6px 100%;
      }

      /* 🔹 أعلى يمين */
      .client-card .corner.tr {
        top: 0;
        right: 0;
        background: linear-gradient(
              to left,
              var(--secondary-color) 4px,
              transparent 100%
            )
            top right no-repeat,
          linear-gradient(
              to bottom,
              var(--secondary-color) 4px,
              transparent 100%
            )
            top right no-repeat;
        background-size: 100% 6px, 6px 100%;
      }

      /* 🔹 أسفل يسار */
      .client-card .corner.bl {
        bottom: 0;
        left: 0;
        background: linear-gradient(
              to right,
              var(--secondary-color) 4px,
              transparent 100%
            )
            bottom left no-repeat,
          linear-gradient(to top, var(--secondary-color) 4px, transparent 100%)
            bottom left no-repeat;
        background-size: 100% 6px, 6px 100%;
      }

      /* 🔹 أسفل يمين */
      .client-card .corner.br {
        bottom: 0;
        right: 0;
        background: linear-gradient(
              to left,
              var(--secondary-color) 4px,
              transparent 100%
            )
            bottom right no-repeat,
          linear-gradient(to top, var(--secondary-color) 4px, transparent 100%)
            bottom right no-repeat;
        background-size: 100% 6px, 6px 100%;
      }

      /* 💫 عند التمرير (Hover) */
      .client-card:hover .corner {
        filter: drop-shadow(0 0 6px var(--secondary-color));
        transform: scale(1.05);
        transition: 0.4s;
      }

      .client-card .client-avatar {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        color: var(--white-color);
        border: 2px solid var(--primary-color);
      }
      .avatar-placeholder img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
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
        border: 1px solid var(--primary-color);
        color: var(--white-color);
        background: rgba(70, 227, 255, 0.24);
      }

      .client-name-container button:hover {
        background: rgba(70, 227, 255, 0.2);
        border-color: var(--primary-color);
      }

      .client-info {
        margin-bottom: 16px;
        color: var(--white-color);
      }

      .client-name {
        color: var(--secondary-color);
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
        color: var(--primary-color);
      }

      .field-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .field-label {
        font-size: 11px;
        color: var(--primary-color);
        font-weight: 500;
      }

      .field-value {
        font-size: 12px;
        color: var(--white-color);
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
        border-top: 1px solid var(--border-dark);
      }

      .client-actions .icon-star {
        width: 15%;
        gap: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .client-actions .icon-star span {
        color: var(--white-color);
      }

      .client-actions .icon-star i {
        font-size: 18px;
        font-weight: 600;
        color: var(--accent-yellow);
        animation: starPulse 2s ease-in-out infinite;
      }

      @keyframes starPulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }

      .icon-social i {
        color: var(--white-color);
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
  @Input() isSelected: boolean = false;

  @Output() selectionChange = new EventEmitter<boolean>();

  onSelectionChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isSelected = isChecked;
    this.selectionChange.emit(isChecked);
  }

  getAvatarImage(): string {
    if (!this.data) {
      return './assets/img/avatar-male.svg';
    }

    // Get gender from data (could be 'gender' field or check multiple possible fields)
    const gender =
      this.data['gender'] || this.data['Gender'] || this.data['genderType'];

    if (!gender) {
      return './assets/img/avatar-male.svg'; // Default image if no gender specified
    }

    // Convert to lowercase string for comparison
    const genderStr = String(gender).toLowerCase().trim();

    // Check if it's a number (0 = Male, 1 = Female)
    if (genderStr === '0' || genderStr === 'male' || genderStr === 'ذكر') {
      return 'assets/img/avatar-male.svg'; // Male image path
    } else if (
      genderStr === '1' ||
      genderStr === 'female' ||
      genderStr === 'أنثى'
    ) {
      return 'assets/img/avatar-female.svg'; // Female image path
    }

    // Default fallback
    return 'assets/logo.svg';
  }
}

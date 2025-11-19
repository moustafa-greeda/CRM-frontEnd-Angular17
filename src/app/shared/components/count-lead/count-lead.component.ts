import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-count-lead',
  template: `
    <div class="countLead">
      <p class="countLead-text">{{ count || 0 }} {{ label || 'عميل' }}</p>
      @if (imageSrc) {
      <img [src]="imageSrc" [alt]="label || 'icon'" class="countLead-image" />
      } @else {
      <i class="bi {{ iconClass }}"></i>
      }
    </div>
  `,
  styles: `
  .countLead {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 12px;
  border: 1px solid var(--primary-color);
  background: #008299;
  color: #fff;
}

.countLead .countLead-text {
  padding: 0px !important;
  margin: 0px !important;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
}

.countLead i {
  font-size: 20px;
}

.countLead-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.countLead:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 6px #404040;
}
  `,
})
export class CountLeadComponent {
  @Input() count: number = 0;
  @Input() label: string = '';
  @Input() iconClass: string = 'bi-person-fill';
  @Input() imageSrc: string = '';
}

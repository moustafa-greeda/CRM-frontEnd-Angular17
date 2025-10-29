import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-count-lead',
  template: `
    <div class="countLead">
      <p class="countLead-text">8 عميل</p>
      <i class="bi bi-person-fill"></i>
    </div>
  `,
  styles: `
  .countLead {
  // width: 150px;
  padding: 5px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 12px;
  border: 1px solid #46e3ff;
  background: #008299;
}

.countLead .countLead-text {
  padding: 0px !important;
  margin: 0px !important;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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
}

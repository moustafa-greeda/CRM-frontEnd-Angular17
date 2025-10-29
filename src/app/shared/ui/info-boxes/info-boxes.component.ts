import { Component, Input } from '@angular/core';

export interface InfoBox {
  label: string;
  value: string | null | undefined;
}

@Component({
  selector: 'app-info-boxes',
  template: `
    <div class="info-boxes">
      <div
        class="client-source border-gradient horizontal thin"
        *ngFor="let box of boxes"
      >
        <span class="label">{{ box.label }} :</span>
        <span class="value">{{ box.value || 'غير محدد' }}</span>
      </div>
    </div>
  `,
  styles: `
  .info-boxes {
    display: flex;
    gap: 30px;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
  }

  .client-source {
    padding: 5px 10px;
    border-radius: 4px;
    text-align: center;
    background: transparent;
  }

  .client-source:hover {
    background: rgba(255, 95, 0, 0.15);
    border-color: #ffb012;
  }

  .label {
    color: #ffb012;
    font-weight: 500;
  }

  .value {
    font-weight: 400;
    color: #ffffff;
  }
  `,
})
export class InfoBoxesComponent {
  @Input() boxes: InfoBox[] = [];
}

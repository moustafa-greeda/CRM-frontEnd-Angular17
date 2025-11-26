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
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
  }

  .client-source {
    width: 47%;
    min-height: 40px;
    margin-bottom: 10px;
    padding: 5px 10px;
    border-radius: 0 15px 0 15px;
    background: transparent;
    display: flex;
    align-items: center;
  }


  .label {
    color: var(--secondary-color);
    font-weight: 500;
    font-size: 12px;
  }

  .value {
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
  }
  `,
})
export class InfoBoxesComponent {
  @Input() boxes: InfoBox[] = [];
}

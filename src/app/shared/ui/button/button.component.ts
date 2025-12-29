import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      class="btn"
      [ngClass]="buttonClass"
      (click)="onClick()"
      [disabled]="disabled"
    >
      {{ buttonText }}
      <i [class]="icon"></i>
    </button>
  `,
  styles: `
  button{
    display: flex;
    align-items: center;
    gap: 8px;
  }
  `,
})
export class ButtonComponent {
  @Input() buttonText: string = 'Button'; // Default button text
  @Input() icon: string = ''; // Default button icon
  @Input() buttonClass: string = 'btn btn-primary'; // Default button class for styling
  @Input() disabled: boolean = false; // Default button disabled

  // Output event when the button is clicked
  @Output() buttonClick = new EventEmitter<void>();

  // Method to handle button click
  onClick() {
    this.buttonClick.emit();
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button class="btn" [ngClass]="buttonClass" (click)="onClick()">
      {{ buttonText }}
    </button>
  `,
  styles: '',
})
export class ButtonComponent {
  @Input() buttonText: string = 'Button'; // Default button text
  @Input() buttonClass: string = 'btn btn-primary'; // Default button class for styling

  // Output event when the button is clicked
  @Output() buttonClick = new EventEmitter<void>();

  // Method to handle button click
  onClick() {
    this.buttonClick.emit();
  }
}

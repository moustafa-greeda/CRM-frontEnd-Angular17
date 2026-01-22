import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      class="btn"
      [class]="'buttonClass'"
      [type]="type"
      (click)="onClick()"
      [disabled]="disabled"
    >
      @if(icon){<i [class]="icon"></i>}
      {{ buttonText }}
    </button>
  `,
  styles: `
  button{
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary,
.button-color {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid var(--color-primary);
  color: #fff;
  background: linear-gradient(90deg, #008299 0%, #002b33 100%);
}

.btn-primary i,
.button-color i {
  font-size: 25px;
}

.btn-primary:hover {
  background: linear-gradient(90deg, #002b33 0%, #008299 100%);
  transform: translateY(-2px);
}

.btn-danger {
  padding: 10px 15px;
  border: 1px solid var(--bg-error);
  border-radius: 8px;
  background: linear-gradient(90deg, #ff4444 0%, #8c1717 100%);
  color: #fff;
}
.btn-danger:hover {
  transform: translateY(-2px) scale(1.05);
  background-color: #ff4444;
  box-shadow: 0 0 8px rgba(220, 53, 69, 0.3);
}
/* ========== Button States ========== */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
// Responsive Design
@media (max-width: 768px) {
  .btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
  `,
})
export class ButtonComponent {
  @Input() buttonText: string = 'Button'; // Default button text
  @Input() icon: string = ''; // Default button icon
  @Input() buttonClass: string = 'btn btn-primary'; // Default button class for styling
  @Input() disabled: boolean = false; // Default button disabled
  @Input() type: string = 'button'; // Default button type

  // Output event when the button is clicked
  @Output() buttonClick = new EventEmitter<void>();

  // Method to handle button click
  onClick() {
    // Use requestAnimationFrame to improve INP
    requestAnimationFrame(() => {
      this.buttonClick.emit();
    });
  }
}

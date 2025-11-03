import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  template: `
    <div
      class="custom-dropdown"
      [class.open]="open"
      appClickOutside
      (appClickOutside)="open = false"
    >
      <button class="dropdown-trigger" type="button" (click)="toggleDropdown()">
        <span class="selected-option">{{ selectedOption || label }}</span>
        <i class="bi bi-chevron-down dropdown-arrow"></i>
      </button>

      <div class="dropdown-menu">
        <div
          class="dropdown-item"
          *ngFor="let opt of options"
          (click)="selectOption(opt)"
        >
          <i class="bi bi-dot"></i>
          <span>{{ opt }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
  .custom-dropdown {
  position: relative;
  width: 100%;
  min-width: 180px;
}

.dropdown-trigger {
  width: 100%;
  min-width: fit-content;
  min-height: 50px;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid #ff5f00;
  background: rgba(17, 24, 31, 0.8);
}

.selected-option {
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: calc(100% - 24px);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  min-width: max-content;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  z-index: 100000000000;
  display: none;
  backdrop-filter: blur(10px);
  border: 1px solid #ff5f00;
  background: rgba(17, 24, 31, 0.9);
}

.custom-dropdown.open .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  color: #fff;
}

.dropdown-item:hover {
  background: rgb(255, 95, 0);
  color: #fff;
}
  `,
})
export class DropdownComponent {
  // Inputs for dropdown label, options, and selected option
  @Input() label: string = '';
  @Input() options: string[] = [];
  @Input() selectedOption: string = '';

  // Output event when an option is selected
  @Output() optionSelected = new EventEmitter<string>();

  // Variable to toggle dropdown open/close
  open: boolean = false;

  // Method to toggle dropdown
  toggleDropdown() {
    this.open = !this.open;
  }

  // Method to select an option
  selectOption(option: string) {
    this.selectedOption = option;
    this.optionSelected.emit(option);
    this.open = false; // Close dropdown after selection
  }
}

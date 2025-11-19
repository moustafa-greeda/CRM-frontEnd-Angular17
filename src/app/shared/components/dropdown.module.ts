import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownContainerComponent } from './dropdown-container/dropdown-container.component';
import { DropdownOptionComponent } from './dropdown-option/dropdown-option.component';
import { TableDropdownComponent } from '../ui/table-dropdown/table-dropdown.component';

@NgModule({
  declarations: [
    DropdownContainerComponent,
    DropdownOptionComponent,
    TableDropdownComponent,
  ],
  imports: [CommonModule],
  exports: [
    DropdownContainerComponent,
    DropdownOptionComponent,
    TableDropdownComponent,
  ],
})
export class DropdownModule {}

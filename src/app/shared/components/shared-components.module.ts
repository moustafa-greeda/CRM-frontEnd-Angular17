import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { CountCardComponent } from './count-card/count-card.component';
import { TableComponent } from './table/table.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { FormUiComponent } from './form-ui/form-ui.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { NotificationCardComponent } from './notification-card/notification-card.component';
import { RecentInteractionsComponent } from './recent-interactions/recent-interactions.component';
import { DropdownModule } from './dropdown.module';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DetailViewDialogComponent } from './detail-view-dialog/detail-view-dialog.component';
import { ViewToggleComponent } from '../ui/view-toggle/view-toggle.component';
import { SearchInputComponent } from '../ui/search-input/search-input.component';
import { ButtonComponent } from '../ui/button/button.component';
import { CountLeadComponent } from './count-lead/count-lead.component';
// import {ContractEditorComponent} from './contract-editor/contract-editor.component'


@NgModule({
  declarations: [
    CountCardComponent,
    TableComponent,
    PageHeaderComponent,
    FormUiComponent,
    ClickOutsideDirective,
    NotificationCardComponent,
    RecentInteractionsComponent,
    DetailViewDialogComponent,
    ViewToggleComponent,
    SearchInputComponent,
    ButtonComponent,
    CountLeadComponent,
    DropdownComponent,
    // ContractEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatDialogModule,
    DropdownModule,
  ],
  exports: [
    CountCardComponent,
    TableComponent,
    PageHeaderComponent,
    FormUiComponent,
    ClickOutsideDirective,
    NotificationCardComponent,
    RecentInteractionsComponent,
    DropdownModule,
    DropdownComponent,
    ViewToggleComponent,
    SearchInputComponent,
    ButtonComponent,
    CountLeadComponent,
  ],
})
export class SharedComponentsModule {}

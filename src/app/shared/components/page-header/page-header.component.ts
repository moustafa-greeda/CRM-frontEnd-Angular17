import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BreadcrumbItem } from '../../interfaces/breadcrumb-item.interface';
import { ActionButton } from './../../interfaces/action-button.interface';
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumb: BreadcrumbItem[] = [];
  @Input() actionButtons: ActionButton[] = [];
}

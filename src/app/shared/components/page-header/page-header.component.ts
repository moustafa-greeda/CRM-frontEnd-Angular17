import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../interfaces/breadcrumb-item.interface';
import { ActionButton } from './../../interfaces/action-button.interface';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumb: BreadcrumbItem[] = [];
  @Input() actionButtons: ActionButton[] = [];
}

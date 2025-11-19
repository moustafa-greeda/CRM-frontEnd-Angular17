import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-view-toggle',
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.css'],
})
export class ViewToggleComponent {
  @Input() viewMode: 'card' | 'table' = 'card';
  @Input() cardLabel: string = 'عرض البطاقات';
  @Input() tableLabel: string = 'عرض الجدول';
  @Output() viewModeChange = new EventEmitter<'card' | 'table'>();

  toggle(): void {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
    this.viewModeChange.emit(this.viewMode);
  }
}

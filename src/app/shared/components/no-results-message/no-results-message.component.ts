import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-no-results-message',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './no-results-message.component.html',
  styleUrls: ['./no-results-message.component.css'],
})
export class NoResultsMessageComponent {
  @Input() title: string = 'لا يوجد نتائج للبحث';
  @Input() description: string = 'لم يتم العثور على نتائج مطابقة لمعايير البحث';
  @Input() icon: string = 'bi bi-search';
  @Input() showResetButton: boolean = true;
  @Input() resetButtonText: string = 'إعادة تعيين الفلاتر';
  @Input() resetButtonClass: string = 'btn btn-danger';
  @Output() resetClick = new EventEmitter<void>();

  onResetClick(): void {
    this.resetClick.emit();
  }
}


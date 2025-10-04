import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-count-card',
  templateUrl: './count-card.component.html',
  styleUrl: './count-card.component.css',
})
export class CountCardComponent {
  // Dynamic page title
  @Input() title: string = 'Overview';

  // Dynamic stats cards
  @Input() stats: { title: string; count: number; icon: string }[] = [];
}

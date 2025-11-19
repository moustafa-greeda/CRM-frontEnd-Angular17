import { Component, Input } from '@angular/core';

interface StatDetail {
  label: string;
  value: string | number;
}

interface StatCard {
  title: string;
  count: string | number;
  icon?: string;
  imageSrc?: string;
  subtitle?: string;
  details?: StatDetail[];
  tooltip?: string;
}

@Component({
  selector: 'app-count-card',
  templateUrl: './count-card.component.html',
  styleUrl: './count-card.component.css',
})
export class CountCardComponent {
  @Input() title: string = '';
  @Input() stats: StatCard[] = [];
}

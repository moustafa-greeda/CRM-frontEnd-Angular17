import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  standalone: true,
  imports: [CommonModule],
  templateUrl: './count-card.component.html',
  styleUrl: './count-card.component.css',
})
export class CountCardComponent {
  @Input() title: string = '';
  @Input() stats: StatCard[] = [];

  onImageError(event: Event, originalSrc?: string): void {
    const img = event.target as HTMLImageElement;
    // Fallback to a default image if the original fails to load
    if (originalSrc && !originalSrc.includes('avatar-male.svg')) {
      img.src = './assets/img/avatar-male.svg';
    }
  }
}

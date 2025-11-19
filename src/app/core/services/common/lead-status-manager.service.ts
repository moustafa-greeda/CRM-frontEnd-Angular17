import { Injectable } from '@angular/core';
import { StatusColorService } from './status-color.service';

@Injectable({ providedIn: 'root' })
export class LeadStatusManagerService {
  constructor(private colors: StatusColorService) {}

  normalize(status: string): string {
    return (status || '').toLowerCase().trim();
  }

  getDisplay(status: string): string {
    return status || '-';
  }

  getColor(status: string): string | null {
    return this.colors.getStatusColor(status);
  }

  getBorderStyle(status: string): Record<string, string> | null {
    const color = this.getColor(status);
    return color ? { borderColor: color } : null;
  }

  getChipClass(status: string): string {
    const norm = this.normalize(status);
    if (!norm) return 'status-default';
    return `status-${norm.replace(/\s+/g, '')}`;
  }
}

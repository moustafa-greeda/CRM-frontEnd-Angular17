import { Injectable } from '@angular/core';

export interface StatusColorConfig {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatusColorService {
  private readonly defaultColorMap: StatusColorConfig = {
    // English statuses
    new: '#4caf50',
    contacted: '#00bcd4',
    qualified: '#2196f3',
    unqualified: '#f44336',
    'in progress': '#ff9800',
    'proposal sent': '#ff9800',
    negotiation: '#9c27b0',
    won: '#388e3c',
    lost: '#f44336',
    'on hold': '#ffc107',
    'no answer': '#607d8b',
    busy: '#795548',
    'call later': '#3f51b5',
    'wrong number': '#e91e63',
    nationality: '#673ab7',
    'not interested': '#f44336',
    interested: '#4caf50',
    thinking: '#ff5722',
    'follow up': '#ff5722',
    'follow-up': '#ff5722',
    closed: '#388e3c',
    pending: '#ffc107',
    meeting: '#673ab7',
    call: '#3f51b5',
    email: '#607d8b',

    // Arabic statuses
    جديد: '#4caf50',
    'تم الاتصال': '#00bcd4',
    مؤهل: '#2196f3',
    'غير مؤهل': '#f44336',
    'قيد التقدم': '#ff9800',
    'تم الإرسال': '#ff9800',
    مقترح: '#ff9800',
    مفاوضات: '#9c27b0',
    فاز: '#388e3c',
    خسر: '#f44336',
    'في الانتظار': '#ffc107',
    'لا إجابة': '#607d8b',
    مشغول: '#795548',
    'اتصال لاحق': '#3f51b5',
    'رقم خاطئ': '#e91e63',
    جنسية: '#673ab7',
    'غير مهتم': '#f44336',
    مهتم: '#4caf50',
    يفكر: '#ff5722',
    متابعة: '#ff5722',
    مغلق: '#388e3c',
    اجتماع: '#673ab7',
    اتصال: '#3f51b5',
    'بريد إلكتروني': '#607d8b',
    'في انتظار': '#ffc107',
  };

  /**
   * Get color for a specific status
   */
  getStatusColor(status: string): string | null {
    if (!status) return null;
    const normalizedStatus = this.normalizeStatus(status);
    return this.defaultColorMap[normalizedStatus] || null;
  }

  /**
   * Get all available status colors
   */
  getAllStatusColors(): StatusColorConfig {
    return { ...this.defaultColorMap };
  }

  /**
   * Get text color based on background color for proper contrast
   */
  getContrastTextColor(backgroundColor: string): string {
    try {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance > 186 ? '#000' : '#fff';
    } catch {
      return '#fff';
    }
  }

  /**
   * Get complete style object for a status
   */
  getStatusStyle(status: string): Record<string, string> | null {
    const color = this.getStatusColor(status);
    if (!color) return null;

    return {
      'background-color': color,
      color: this.getContrastTextColor(color),
      border: 'none',
    };
  }

  /**
   * Normalize status string for consistent lookup
   */
  private normalizeStatus(status: string): string {
    return (status || '').toLowerCase().trim();
  }
}

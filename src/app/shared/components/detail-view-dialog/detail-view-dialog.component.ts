import {
  Component,
  Inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/*---------------------------- Interfaces --------------*/
export interface DetailViewDialogData {
  title?: string;
  data: Record<string, any>;
  fields?: Array<{
    key: string;
    label: string;
    type?: 'text' | 'url' | 'email' | 'phone' | 'date' | 'boolean' | 'json';
  }>;
}

@Component({
  selector: 'app-detail-view-dialog',
  templateUrl: './detail-view-dialog.component.html',
  styleUrls: ['./detail-view-dialog.component.css'],
})
export class DetailViewDialogComponent implements AfterViewInit {
  /*---------------------------- Properties --------------*/
  get displayTitle(): string {
    return this.data.title || 'تفاصيل البيانات';
  }

  get displayFields(): Array<{
    key: string;
    label: string;
    value: any;
    type?: string;
  }> {
    if (this.data.fields && this.data.fields.length > 0) {
      return this.data.fields.map((field) => ({
        key: field.key,
        label: field.label,
        value: this.data.data[field.key],
        type: field.type || 'text',
      }));
    }

    // Auto-generate fields from data object
    return Object.keys(this.data.data).map((key) => ({
      key,
      label: this.formatLabel(key),
      value: this.data.data[key],
      type: this.detectFieldType(key, this.data.data[key]),
    }));
  }

  @ViewChildren('notesTextarea') textareas!: QueryList<
    ElementRef<HTMLTextAreaElement>
  >;

  /*---------------------------- Constructor --------------*/
  constructor(
    public dialogRef: MatDialogRef<DetailViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailViewDialogData,
    private cdr: ChangeDetectorRef
  ) {}

  /*---------------------------- Methods --------------*/
  formatLabel(key: string): string {
    // Convert camelCase to readable Arabic labels
    const labelMap: Record<string, string> = {
      name: 'الاسم',
      companyName: 'اسم الشركة',
      jobTitle: 'المسمى الوظيفي',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      age: 'العمر',
      webSiteUrl: 'رابط الموقع',
      notes: 'ملاحظات',
      isHaveSocialMedia: 'هل يملك حسابات على الشبكات الاجتماعية',
      socialMediaLink: 'رابط الحساب الاجتماعي',
      industryId: 'معرف الصناعة',
      locationId: 'معرف الموقع',
      companyId: 'معرف الشركة',
      preferredLanguage: 'اللغة المفضلة',
      jobLevelLookupId: 'معرف المستوى الوظيفي',
      gender: 'الجنس',
      cityId: 'معرف المدينة',
      countryId: 'معرف الدولة',
      postalCode: 'الرمز البريدي',
      addressLine: 'عنوان الشارع',
      id: 'المعرف',
      createdAt: 'تاريخ الإنشاء',
      importedAt: 'تاريخ الاستيراد',
    };

    return labelMap[key] || key;
  }

  detectFieldType(key: string, value: any): string {
    if (!value) return 'text';

    if (
      key.toLowerCase().includes('url') ||
      key.toLowerCase().includes('link')
    ) {
      return 'url';
    }
    if (key.toLowerCase().includes('email')) {
      return 'email';
    }
    if (key.toLowerCase().includes('phone')) {
      return 'phone';
    }
    if (key.toLowerCase().includes('date')) {
      return 'date';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'object') {
      return 'json';
    }

    return 'text';
  }

  formatValue(value: any, type?: string): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (type) {
      case 'boolean':
        return value ? 'نعم' : 'لا';
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('ar-SA');
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }
        }
        return value;
      case 'json':
        // Check if value is already a JSON string
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return JSON.stringify(parsed, null, 2);
          } catch {
            return value;
          }
        }
        return JSON.stringify(value, null, 2);
      default:
        return String(value);
    }
  }

  isUrl(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    return value.startsWith('http://') || value.startsWith('https://');
  }

  ngAfterViewInit(): void {
    // Adjust textarea height after view initialization
    setTimeout(() => {
      this.adjustAllTextareas();
    }, 100);
  }

  adjustAllTextareas(): void {
    this.textareas.forEach((textareaRef) => {
      const textarea = textareaRef.nativeElement;
      if (textarea) {
        // Reset height to get accurate scrollHeight
        textarea.style.height = 'auto';
        // Get the actual content height
        const scrollHeight = textarea.scrollHeight;
        const minHeight = 120;
        // Set height to fit all content
        textarea.style.height = Math.max(minHeight, scrollHeight) + 'px';
        // Enable scrolling only if content is very long
        if (scrollHeight > 600) {
          textarea.style.maxHeight = '600px';
          textarea.style.overflowY = 'auto';
        } else {
          textarea.style.maxHeight = 'none';
          textarea.style.overflowY = 'hidden';
        }
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

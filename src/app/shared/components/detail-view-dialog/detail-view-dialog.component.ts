// import {
//   Component,
//   Inject,
//   AfterViewInit,
//   ViewChild,
//   ElementRef,
//   QueryList,
//   ViewChildren,
//   ChangeDetectorRef,
// } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// /*---------------------------- Interfaces --------------*/
// export interface DetailViewDialogData {
//   title?: string;
//   data: Record<string, any>;
//   fields?: Array<{
//     key: string;
//     label: string;
//     type?: 'text' | 'url' | 'email' | 'phone' | 'date' | 'boolean' | 'json';
//   }>;
// }

// @Component({
//   selector: 'app-detail-view-dialog',
//   templateUrl: './detail-view-dialog.component.html',
//   styleUrls: ['./detail-view-dialog.component.css'],
// })
// export class DetailViewDialogComponent implements AfterViewInit {
//   /*---------------------------- Properties --------------*/
//   get displayTitle(): string {
//     return this.data.title || 'تفاصيل البيانات';
//   }

//   get displayFields(): Array<{
//     key: string;
//     label: string;
//     value: any;
//     type?: string;
//   }> {
//     if (this.data.fields && this.data.fields.length > 0) {
//       return this.data.fields.map((field) => ({
//         key: field.key,
//         label: field.label,
//         value: this.data.data[field.key],
//         type: field.type || 'text',
//       }));
//     }

//     // Auto-generate fields from data object
//     return Object.keys(this.data.data).map((key) => ({
//       key,
//       label: this.formatLabel(key),
//       value: this.data.data[key],
//       type: this.detectFieldType(key, this.data.data[key]),
//     }));
//   }

//   @ViewChildren('notesTextarea') textareas!: QueryList<
//     ElementRef<HTMLTextAreaElement>
//   >;

//   /*---------------------------- Constructor --------------*/
//   constructor(
//     public dialogRef: MatDialogRef<DetailViewDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: DetailViewDialogData,
//     private cdr: ChangeDetectorRef
//   ) {}

//   /*---------------------------- Methods --------------*/
//   formatLabel(key: string): string {
//     // Convert camelCase to readable Arabic labels
//     const labelMap: Record<string, string> = {
//       name: 'الاسم',
//       companyName: 'اسم الشركة',
//       jobTitle: 'المسمى الوظيفي',
//       email: 'البريد الإلكتروني',
//       phone: 'رقم الهاتف',
//       age: 'العمر',
//       webSiteUrl: 'رابط الموقع',
//       notes: 'ملاحظات',
//       isHaveSocialMedia: 'هل يملك حسابات على الشبكات الاجتماعية',
//       socialMediaLink: 'رابط الحساب الاجتماعي',
//       industryId: 'معرف الصناعة',
//       locationId: 'معرف الموقع',
//       companyId: 'معرف الشركة',
//       preferredLanguage: 'اللغة المفضلة',
//       jobLevelLookupId: 'معرف المستوى الوظيفي',
//       gender: 'الجنس',
//       cityId: 'معرف المدينة',
//       countryId: 'معرف الدولة',
//       postalCode: 'الرمز البريدي',
//       addressLine: 'عنوان الشارع',
//       id: 'المعرف',
//       createdAt: 'تاريخ الإنشاء',
//       importedAt: 'تاريخ الاستيراد',
//     };

//     return labelMap[key] || key;
//   }

//   detectFieldType(key: string, value: any): string {
//     if (!value) return 'text';

//     if (
//       key.toLowerCase().includes('url') ||
//       key.toLowerCase().includes('link')
//     ) {
//       return 'url';
//     }
//     if (key.toLowerCase().includes('email')) {
//       return 'email';
//     }
//     if (key.toLowerCase().includes('phone')) {
//       return 'phone';
//     }
//     if (key.toLowerCase().includes('date')) {
//       return 'date';
//     }
//     if (typeof value === 'boolean') {
//       return 'boolean';
//     }
//     if (typeof value === 'object') {
//       return 'json';
//     }

//     return 'text';
//   }

//   formatValue(value: any, type?: string): string {
//     if (value === null || value === undefined || value === '') {
//       return '-';
//     }

//     switch (type) {
//       case 'boolean':
//         return value ? 'نعم' : 'لا';
//       case 'date':
//         if (value instanceof Date) {
//           return value.toLocaleDateString('ar-SA');
//         }
//         if (typeof value === 'string') {
//           const date = new Date(value);
//           if (!isNaN(date.getTime())) {
//             return date.toLocaleDateString('ar-SA', {
//               year: 'numeric',
//               month: 'long',
//               day: 'numeric',
//             });
//           }
//         }
//         return value;
//       case 'json':
//         // Check if value is already a JSON string
//         if (typeof value === 'string') {
//           try {
//             const parsed = JSON.parse(value);
//             return JSON.stringify(parsed, null, 2);
//           } catch {
//             return value;
//           }
//         }
//         return JSON.stringify(value, null, 2);
//       default:
//         return String(value);
//     }
//   }

//   isUrl(value: string): boolean {
//     if (!value || typeof value !== 'string') return false;
//     return value.startsWith('http://') || value.startsWith('https://');
//   }

//   ngAfterViewInit(): void {
//     // Adjust textarea height after view initialization
//     setTimeout(() => {
//       this.adjustAllTextareas();
//     }, 100);
//   }

//   adjustAllTextareas(): void {
//     this.textareas.forEach((textareaRef) => {
//       const textarea = textareaRef.nativeElement;
//       if (textarea) {
//         // Reset height to get accurate scrollHeight
//         textarea.style.height = 'auto';
//         // Get the actual content height
//         const scrollHeight = textarea.scrollHeight;
//         const minHeight = 120;
//         // Set height to fit all content - always show all text
//         textarea.style.height = Math.max(minHeight, scrollHeight) + 'px';
//         // Remove max-height restriction to show all content
//         textarea.style.maxHeight = 'none';
//         textarea.style.overflowY = 'visible';
//         // Ensure text wraps properly
//         textarea.style.wordWrap = 'break-word';
//         textarea.style.wordBreak = 'break-word';
//         textarea.style.overflowWrap = 'break-word';
//         textarea.style.whiteSpace = 'pre-wrap';
//       }
//     });
//   }

//   close(): void {
//     this.dialogRef.close();
//   }
// }

import {
  Component,
  Inject,
  AfterViewInit,
  ViewChildren,
  ElementRef,
  QueryList,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifyDialogService } from '../notify-dialog-host/notify-dialog.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailViewDialogComponent implements AfterViewInit {
  @ViewChildren('notesTextarea')
  textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    public dialogRef: MatDialogRef<DetailViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailViewDialogData,
    private cdr: ChangeDetectorRef,
    private notify: NotifyDialogService
  ) {}

  /*---------------------------- Getters --------------*/
  get displayTitle(): string {
    return this.data?.title || 'تفاصيل البيانات';
  }

  get displayFields(): Array<{
    key: string;
    label: string;
    value: any;
    type?: string;
  }> {
    if (this.data?.fields && this.data.fields.length > 0) {
      return this.data.fields.map((field) => ({
        key: field.key,
        label: field.label,
        value: this.data.data?.[field.key],
        type:
          field.type ||
          this.detectFieldType(field.key, this.data.data?.[field.key]),
      }));
    }

    if (!this.data?.data) {
      return [];
    }

    // Auto-generate fields from data object
    return Object.keys(this.data.data).map((key) => {
      const value = this.data.data[key];
      return {
        key,
        label: this.formatLabel(key),
        value,
        type: this.detectFieldType(key, value),
      };
    });
  }

  /*---------------------------- Lifecycle --------------*/
  ngAfterViewInit(): void {
    // Adjust textarea height after view initialization
    setTimeout(() => {
      this.adjustAllTextareas();
    }, 100);
  }

  /*---------------------------- Label / Type Helpers --------------*/
  formatLabel(key: string): string {
    // Convert known keys to readable Arabic labels
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
    if (value === null || value === undefined) return 'text';

    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('url') || lowerKey.includes('link')) {
      return 'url';
    }
    if (lowerKey.includes('email')) {
      return 'email';
    }
    if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
      return 'phone';
    }
    if (lowerKey.includes('date') || lowerKey.endsWith('at')) {
      return 'date';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return 'json';
    }

    return 'text';
  }

  /*---------------------------- Value Formatting --------------*/
  formatValue(value: any, type?: string): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (type) {
      case 'boolean':
        return value ? 'نعم' : 'لا';

      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
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
        return String(value);

      case 'json':
        try {
          let parsed: any;
          if (typeof value === 'string') {
            parsed = JSON.parse(value);
          } else {
            parsed = value;
          }

          // Format as key-value pairs for better readability
          return this.formatJsonAsKeyValue(parsed);
        } catch {
          return String(value);
        }

      default:
        return String(value);
    }
  }

  isUrl(value: any): boolean {
    if (!value || typeof value !== 'string') return false;
    return value.startsWith('http://') || value.startsWith('https://');
  }

  /*---------------------------- JSON Formatting --------------*/
  formatJsonAsKeyValue(obj: any): string {
    if (obj === null || obj === undefined) {
      return 'null';
    }

    if (typeof obj !== 'object') {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj
        .map((item, index) => {
          const value = this.formatJsonValue(item);
          return `[${index}]: ${value}`;
        })
        .join('\n');
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    return entries
      .map(([key, value]) => {
        const formattedValue = this.formatJsonValue(value);
        return `${key}: ${formattedValue}`;
      })
      .join('\n');
  }

  formatJsonValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value.map((item) => this.formatJsonValue(item)).join(', ');
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) return '{}';
      return entries
        .map(([key, val]) => `${key}: ${this.formatJsonValue(val)}`)
        .join(', ');
    }

    return String(value);
  }

  /*---------------------------- Textarea Auto-Resize --------------*/
  adjustAllTextareas(): void {
    if (!this.textareas) return;

    this.textareas.forEach((textareaRef) => {
      const textarea = textareaRef.nativeElement;
      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const minHeight = 120;
        textarea.style.height = Math.max(minHeight, scrollHeight) + 'px';
        textarea.style.maxHeight = 'none';
        textarea.style.overflowY = 'visible';
        textarea.style.wordWrap = 'break-word';
        textarea.style.wordBreak = 'break-word';
        textarea.style.overflowWrap = 'break-word';
        textarea.style.whiteSpace = 'pre-wrap';
      }
    });

    this.cdr.markForCheck();
  }

  /*---------------------------- Actions --------------*/
  copyToClipboard(value: any): void {
    if (value === null || value === undefined || value === '') return;

    const text = typeof value === 'string' ? value : JSON.stringify(value);
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        // Show success notification
        this.notify.success({
          title: 'تم النسخ',
          description: 'تم نسخ القيمة إلى الحافظة بنجاح',
        });
      })
      .catch(() => {
        // Show error notification
        this.notify.error({
          title: 'فشل النسخ',
          description: 'حدث خطأ أثناء نسخ القيمة',
        });
        console.warn('Failed to copy to clipboard');
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  /*---------------------------- TrackBy --------------*/
  trackByFieldKey(_: number, field: { key: string }) {
    return field.key;
  }
}

// import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MailsService, IMail, ISendMailRequest } from './mails.service';
// import { NotifyDialogService } from '../../../../../../../shared/components/notify-dialog-host/notify-dialog.service';

// @Component({
//   selector: 'app-mails',
//   templateUrl: './mails.component.html',
//   styleUrls: ['./mails.component.css', '../notes/notes.component.css'],
// })
// export class MailsComponent implements OnInit {
//   isFormVisible: boolean = false;
//   mailForm!: FormGroup;
//   mailsList: IMail[] = [];
//   isLoading: boolean = false;
//   selectedAttachments: File[] = [];
//   @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
//   constructor(
//     private fb: FormBuilder,
//     private mailsService: MailsService,
//     private notify: NotifyDialogService
//   ) {}

//   ngOnInit(): void {
//     this.initForm();
//     this.loadMails();
//   }
//   // ==================================== toggel form ===============================
//   toggelForm(): void {
//     this.isFormVisible = !this.isFormVisible;
//     if (this.isFormVisible) {
//       this.initForm();
//     }
//   }

//   // ==================================== init form ===============================
//   initForm(): void {
//     this.mailForm = this.fb.group({
//       to: ['', [Validators.required, Validators.email]],
//       subject: ['', [Validators.required]],
//       body: ['', [Validators.required]],
//       cc: [''],
//       bcc: [''],
//     });
//   }

//   // ==================================== trigger file input ===============================
//   triggerFileInput(): void {
//     this.fileInput?.nativeElement.click();
//   }

//   // ==================================== load mails ===============================
//   loadMails(): void {
//     this.isLoading = true;
//     // TODO: Get clientId from parent component or route params
//     this.mailsService.getAllMails().subscribe({
//       next: (response) => {
//         this.isLoading = false;
//         if (response && response.succeeded && response.data) {
//           this.mailsList = response.data;
//         } else {
//           this.mailsList = [];
//         }
//       },
//       error: (error) => {
//         this.isLoading = false;
//         console.error('Error loading mails:', error);
//         this.mailsList = [];
//         // Load mock data for development
//         this.loadMockMails();
//       },
//     });
//   }

//   // ==================================== load mock mails (for development) ===============================
//   loadMockMails(): void {
//     this.mailsList = [
//       {
//         id: 1,
//         to: 'client@example.com',
//         subject: 'عرض سعر',
//         body: 'نود أن نقدم لكم عرضنا الخاص',
//         sentAt: '2024-01-15T10:30:00',
//         status: 'sent',
//       },
//       {
//         id: 2,
//         to: 'client2@example.com',
//         subject: 'متابعة',
//         body: 'نود متابعة طلبكم',
//         sentAt: '2024-01-14T14:20:00',
//         status: 'sent',
//       },
//     ];
//   }

//   // ==================================== on mail submit ===============================
//   onMailSubmit(): void {
//     if (this.mailForm.valid) {
//       this.isLoading = true;
//       const mailData: ISendMailRequest = {
//         to: this.mailForm.value.to,
//         subject: this.mailForm.value.subject,
//         body: this.mailForm.value.body,
//         cc: this.mailForm.value.cc || undefined,
//         bcc: this.mailForm.value.bcc || undefined,
//         attachments:
//           this.selectedAttachments.length > 0
//             ? this.selectedAttachments
//             : undefined,
//       };

//       this.mailsService.sendMail(mailData).subscribe({
//         next: (response) => {
//           this.isLoading = false;
//           if (response && response.succeeded) {
//             this.notify.success({
//               title: 'نجاح',
//               description: 'تم إرسال البريد الإلكتروني بنجاح',
//             });
//             // Reset form
//             this.mailForm.reset();
//             this.selectedAttachments = [];
//             // Reload mails list
//             this.loadMails();
//           } else {
//             this.notify.error({
//               title: 'فشل الإرسال',
//               description: response?.message || 'حدث خطأ أثناء إرسال البريد',
//             });
//           }
//         },
//         error: (error) => {
//           this.isLoading = false;
//           console.error('Error sending mail:', error);
//           this.notify.error({
//             title: 'فشل الإرسال',
//             description: error?.error?.message || 'حدث خطأ أثناء إرسال البريد',
//           });
//         },
//       });
//     } else {
//       this.notify.error({
//         title: 'خطأ في البيانات',
//         description: 'يرجى ملء جميع الحقول المطلوبة',
//       });
//     }
//   }

//   // ==================================== on attachment selected ===============================
//   onAttachmentSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.selectedAttachments = Array.from(input.files);
//     }
//   }

//   // ==================================== remove attachment ===============================
//   removeAttachment(index: number): void {
//     this.selectedAttachments.splice(index, 1);
//   }

//   // ==================================== track by mail id ===============================
//   trackByMailId(index: number, mail: IMail): number {
//     return mail.id;
//   }

//   // ==================================== get mail status class ===============================
//   getMailStatusClass(status: string): string {
//     switch (status) {
//       case 'sent':
//         return 'status-sent';
//       case 'failed':
//         return 'status-failed';
//       case 'draft':
//         return 'status-draft';
//       default:
//         return '';
//     }
//   }

//   // ==================================== get status icon ===============================
//   getStatusIcon(status: string): string {
//     switch (status) {
//       case 'sent':
//         return 'bi bi-check-circle';
//       case 'failed':
//         return 'bi bi-x-circle';
//       case 'draft':
//         return 'bi bi-file-earmark';
//       default:
//         return 'bi bi-circle';
//     }
//   }

//   // ==================================== format file size ===============================
//   formatFileSize(bytes: number): string {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
//   }

//   // ==================================== get total size ===============================
//   getTotalSize(): number {
//     return this.selectedAttachments.reduce(
//       (total, file) => total + file.size,
//       0
//     );
//   }

//   // ==================================== get file icon ===============================
//   getFileIcon(fileName: string): string {
//     const extension = fileName.split('.').pop()?.toLowerCase() || '';
//     const iconMap: { [key: string]: string } = {
//       pdf: 'bi bi-file-earmark-pdf',
//       doc: 'bi bi-file-earmark-word',
//       docx: 'bi bi-file-earmark-word',
//       xls: 'bi bi-file-earmark-excel',
//       xlsx: 'bi bi-file-earmark-excel',
//       ppt: 'bi bi-file-earmark-ppt',
//       pptx: 'bi bi-file-earmark-ppt',
//       jpg: 'bi bi-file-earmark-image',
//       jpeg: 'bi bi-file-earmark-image',
//       png: 'bi bi-file-earmark-image',
//       gif: 'bi bi-file-earmark-image',
//       zip: 'bi bi-file-earmark-zip',
//       rar: 'bi bi-file-earmark-zip',
//       txt: 'bi bi-file-earmark-text',
//       default: 'bi bi-file-earmark',
//     };
//     return iconMap[extension] || iconMap['default'];
//   }

//   // ==================================== get file type ===============================
//   getFileType(fileName: string): string {
//     const extension = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
//     return extension;
//   }
// }

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';

import { MailsService, IMail } from './mails.service';
import { NotifyDialogService } from '../../../../../../../shared/components/notify-dialog-host/notify-dialog.service';
import { createMailForm } from './mails.form';
import { MailAttachments } from './mails.attachments';
import { formatFileSize, getFileIcon, getStatusMeta } from './mails.helpers';

@Component({
  selector: 'app-mails',
  templateUrl: './mails.component.html',
  styleUrls: ['./mails.component.css', '../notes/notes.component.css'],
})
export class MailsComponent implements OnInit {
  isFormVisible = false;
  isLoading = false;

  mailForm!: FormGroup;
  mails: IMail[] = [];
  attachments = new MailAttachments();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private mailsService: MailsService,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
    this.mailForm = createMailForm(this.fb);
    this.loadMails();
  }

  toggleForm(): void {
    this.isFormVisible = !this.isFormVisible;
    if (this.isFormVisible) this.mailForm.reset();
  }

  loadMails(): void {
    this.isLoading = true;
    this.mailsService
      .getMockMails()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((response) => (this.mails = response.data ?? []));
  }

  submit(): void {
    if (this.mailForm.invalid) return;

    const payload = {
      ...this.mailForm.getRawValue(),
      attachments: this.attachments.files.length
        ? this.attachments.files
        : undefined,
    };

    this.isLoading = true;
    this.mailsService
      .sendMail(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.onSuccess(),
        error: (err) => this.onError(err),
      });
  }

  private onSuccess(): void {
    this.notify.success({ title: 'نجاح', description: 'تم الإرسال' });
    this.mailForm.reset();
    this.attachments.clear();
    this.loadMails();
  }

  private onError(err: any): void {
    this.notify.error({
      title: 'فشل',
      description: err?.message ?? 'حدث خطأ',
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachments.add(input.files);
  }

  removeAttachment(index: number): void {
    this.attachments.remove(index);
  }

  trackById(_: number, mail: IMail): number {
    return mail.id;
  }

  formatFileSize = formatFileSize;
  getFileIcon = getFileIcon;
  getStatusMeta = getStatusMeta;
}

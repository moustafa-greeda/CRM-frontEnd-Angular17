import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MailsService, IMail } from './mails.service';
import { NotifyDialogService } from '../../../../../../shared/components/notify-dialog-host/notify-dialog.service';
import { createMailForm } from './mails.form';
import { MailAttachments } from './mails.attachments';
import { formatFileSize, getFileIcon, getStatusMeta } from './mails.helpers';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-mails',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent],
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

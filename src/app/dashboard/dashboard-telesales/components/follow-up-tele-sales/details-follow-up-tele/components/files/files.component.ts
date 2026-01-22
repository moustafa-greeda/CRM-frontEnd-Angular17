import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifyDialogService } from '../../../../../../../shared/components/notify-dialog-host/notify-dialog.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css', '../notes/notes.component.css'],
})
export class FilesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  filesList: any[] = [];
  isLoading: boolean = false;
  fileForm!: FormGroup;
  selectedFiles: File[] = [];
  constructor(private _fb: FormBuilder, private _notify: NotifyDialogService) {}
  // ==================================== ng on init ===============================
  ngOnInit(): void {
    this.initForm();
    this.loadFiles();
  }
  // ==================================== init form ===============================
  initForm(): void {
    this.fileForm = this._fb.group({
      name: [''],
      dateTime: [''],
    });
  }
  // ==================================== load files ===============================
  loadFiles(): void {
    this.isLoading = true;
    // Mock data for files
    this.filesList = [
      {
        id: 1,
        name: 'عقد_الخدمة.pdf',
        fileName: 'عقد_الخدمة.pdf',
        fileType: 'pdf',
        fileSize: '2.5 MB',
        dateTime: '2024-01-15T10:30:00',
        uploadedBy: 'أحمد محمد',
      },
      {
        id: 2,
        name: 'ملف_العرض.docx',
        fileName: 'ملف_العرض.docx',
        fileType: 'docx',
        fileSize: '1.8 MB',
        dateTime: '2024-01-14T14:20:00',
        uploadedBy: 'سارة علي',
      },
      {
        id: 3,
        name: 'صورة_الهوية.jpg',
        fileName: 'صورة_الهوية.jpg',
        fileType: 'jpg',
        fileSize: '850 KB',
        dateTime: '2024-01-13T09:15:00',
        uploadedBy: 'محمد خالد',
      },
      {
        id: 4,
        name: 'التقرير_الشهري.xlsx',
        fileName: 'التقرير_الشهري.xlsx',
        fileType: 'xlsx',
        fileSize: '3.2 MB',
        dateTime: '2024-01-12T16:45:00',
        uploadedBy: 'فاطمة حسن',
      },
      {
        id: 5,
        name: 'ملف_الضمان.zip',
        fileName: 'ملف_الضمان.zip',
        fileType: 'zip',
        fileSize: '5.1 MB',
        dateTime: '2024-01-11T11:00:00',
        uploadedBy: 'علي أحمد',
      },
    ];
    this.isLoading = false;
  }

  // ==================================== get file icon ===============================
  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      pdf: 'bi-file-earmark-pdf',
      docx: 'bi-file-earmark-word',
      doc: 'bi-file-earmark-word',
      xlsx: 'bi-file-earmark-excel',
      xls: 'bi-file-earmark-excel',
      jpg: 'bi-file-earmark-image',
      jpeg: 'bi-file-earmark-image',
      png: 'bi-file-earmark-image',
      zip: 'bi-file-earmark-zip',
      rar: 'bi-file-earmark-zip',
      default: 'bi-file-earmark',
    };
    return iconMap[fileType.toLowerCase()] || iconMap['default'];
  }

  // ==================================== trigger file input ===============================
  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }
  // ==================================== on file selected ===============================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
      this._notify.success({
        title: 'نجاح',
        description: 'تم الاضافة بنجاح',
      });
      console.log('Selected files:', this.selectedFiles);
    } else {
      this._notify.error({
        title: 'فشل الاضافة',
        description: 'يرجى اختيار ملفات',
      });
    }
  }

  // ==================================== on file submit ===============================
  onFileSubmit(): void {
    if (this.fileForm.valid && this.selectedFiles.length > 0) {
      console.log('File form submitted:', this.fileForm.value);
      console.log('Files to upload:', this.selectedFiles);
      this._notify.success({
        title: 'نجاح',
        description: 'تم الاضافة بنجاح',
      });
    }
  }
  // ==================================== track by file id ===============================
  trackByFileId(index: number, file: any): number {
    return file.id;
  }

  // ==================================== on edit file ===============================
  onEditFile(fileId: number): void {
    console.log('Edit file:', fileId);
    // TODO: Implement edit file functionality
  }
}

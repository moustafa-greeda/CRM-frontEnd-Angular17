import { Component } from '@angular/core';

@Component({
  selector: 'app-exported-data',
  templateUrl: './exported-data.component.html',
  styleUrl: './exported-data.component.css',
})
export class ExportedDataComponent {
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/sales' },
    { label: ' استقبال البيانات المصدرة', link: null },
  ];
}

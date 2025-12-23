import { Component } from '@angular/core';

@Component({
  selector: 'app-follow-up-tele-sales',
  templateUrl: './follow-up-tele-sales.component.html',
  styleUrl: './follow-up-tele-sales.component.css',
})
export class FollowUpTeleSalesComponent {
  pageTitle = 'المتابعة';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المتابعة', link: '/dashboard/telesales/follow-up-tele' },
  ];
}

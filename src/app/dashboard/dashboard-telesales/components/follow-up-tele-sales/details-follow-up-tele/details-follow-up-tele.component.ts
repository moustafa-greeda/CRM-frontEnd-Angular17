import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFollowUpPersonal } from '../../../interfaces/IFollowUp';
import { FollowupDetailsService } from './followup-details.service';

@Component({
  selector: 'app-details-follow-up-tele',
  templateUrl: './details-follow-up-tele.component.html',
  styleUrl: './details-follow-up-tele.component.css',
})
export class DetailsFollowUpTeleComponent {
  pageTitle = 'تفاصيل المتابعة';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المتابعة', link: '/dashboard/telesales/follow-up-tele' },
    {
      label: 'تفاصيل المتابعة',
      link: '/dashboard/telesales/follow-up-tele/view/:contactId',
    },
  ];
  contactId: number = 0;
  details: IFollowUpPersonal[] = [];
  constructor(
    private route: ActivatedRoute,
    private _followupDetailsService: FollowupDetailsService
  ) {
    this.contactId = this.route.snapshot.params['contactId'];
  }
  ngOnInit(): void {
    this.getDetails();
  }
  getDetails(): void {
    this._followupDetailsService
      .getFollowUpDetailsById(this.contactId.toString())
      .subscribe({
        next: (res: any) => {
          this.details = res.data;
          console.log(res, 'res');
        },
      });
  }
}

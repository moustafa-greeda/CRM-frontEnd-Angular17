import { Component, OnInit } from '@angular/core';
import { ReportAiService } from './report-ai.service';
import { ActivatedRoute } from '@angular/router';
import { IReportAiForLead } from '../../../interfaces/IFollowUp';

@Component({
  selector: 'app-report-ai',
  templateUrl: './report-ai.component.html',
  styleUrl: './report-ai.component.css',
})
export class ReportAiComponent implements OnInit {
  contactId: number = 0;
  reportData: IReportAiForLead | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private _reportAiService: ReportAiService
  ) {}

  ngOnInit(): void {
    this.contactId = this.route.snapshot.params['contactId'];
    this.getReportAiForLeadById();
  }

  getReportAiForLeadById(): void {
    this.isLoading = true;
    this.error = null;
    this._reportAiService
      .getReportAiForLeadById(this.contactId.toString())
      .subscribe({
        next: (res: any) => {
          this.reportData = {
            data: res.data,
          };
          // }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading AI report:', error);
          this.error = 'حدث خطأ في تحميل التقرير';
          this.isLoading = false;
        },
      });
  }
}

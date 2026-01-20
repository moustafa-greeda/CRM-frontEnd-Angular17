import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { ApiResponse } from '../../../../../../core/Models/api-response.model';

export interface ISendMailRequest {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  attachments?: File[];
}

export interface IMail {
  id: number;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'draft';
}

@Injectable({
  providedIn: 'root',
})
export class MailsService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================================== send mail ===========================================
  sendMail(mailData: ISendMailRequest): Observable<ApiResponse<IMail>> {
    // If there are attachments, use FormData
    if (mailData.attachments && mailData.attachments.length > 0) {
      const formData = new FormData();
      formData.append('to', mailData.to);
      formData.append('subject', mailData.subject);
      formData.append('body', mailData.body);
      if (mailData.cc) formData.append('cc', mailData.cc);
      if (mailData.bcc) formData.append('bcc', mailData.bcc);

      mailData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      return this.http.post<ApiResponse<IMail>>(
        `${this.BASE_API_URL}/Mail/SendMail`,
        formData
      );
    } else {
      // Send as JSON if no attachments
      return this.http.post<ApiResponse<IMail>>(
        `${this.BASE_API_URL}/Mail/SendMail`,
        mailData
      );
    }
  }

  // ==================================== get all mails ===========================================
  getAllMails(clientId?: number): Observable<ApiResponse<IMail[]>> {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId.toString());
    }
    return this.http.get<ApiResponse<IMail[]>>(
      `${this.BASE_API_URL}/Mail/GetAllMails`,
      { params }
    );
  }

  // ==================================== get mock mails ===========================================
  getMockMails(): Observable<ApiResponse<IMail[]>> {
    const mockMails: IMail[] = [
      {
        id: 1,
        to: 'client@example.com',
        subject: 'عرض سعر',
        body: 'نود أن نقدم لكم عرضنا الخاص بالخدمات المطلوبة. يرجى مراجعة المرفقات للتفاصيل الكاملة.',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
      },
      {
        id: 2,
        to: 'client2@example.com',
        subject: 'متابعة الطلب',
        body: 'نود متابعة طلبكم والتأكد من استلامكم للعرض المقدم. يرجى التواصل معنا في أقرب وقت ممكن.',
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
      },
      {
        id: 3,
        to: 'client3@example.com',
        subject: 'تأكيد الموعد',
        body: 'نود تأكيد موعد الاجتماع المقرر يوم الأحد القادم في تمام الساعة العاشرة صباحاً.',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
      },
      {
        id: 4,
        to: 'client4@example.com',
        subject: 'مسودة - عرض الخدمات',
        body: 'هذه مسودة للعرض المقدم. يرجى مراجعتها قبل الإرسال النهائي.',
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
      },
      {
        id: 5,
        to: 'client5@example.com',
        subject: 'فشل الإرسال - إعادة المحاولة',
        body: 'عذراً، حدث خطأ أثناء محاولة إرسال البريد السابق. نعمل على حل المشكلة.',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'failed',
      },
      {
        id: 6,
        to: 'client6@example.com',
        subject: 'شكراً لكم',
        body: 'نود أن نتقدم بجزيل الشكر لكم على تعاونكم معنا. نأمل أن تكونوا راضين عن خدماتنا.',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'sent',
      },
    ];

    const response: ApiResponse<IMail[]> = {
      succeeded: true,
      data: mockMails,
      message: 'تم جلب البيانات بنجاح',
    };

    return of(response).pipe(delay(500)); // Simulate network delay
  }

  // ==================================== send mock mail ===========================================
  sendMockMail(mailData: ISendMailRequest): Observable<ApiResponse<IMail>> {
    const mockMail: IMail = {
      id: Date.now(),
      to: mailData.to,
      subject: mailData.subject,
      body: mailData.body,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };

    const response: ApiResponse<IMail> = {
      succeeded: true,
      data: mockMail,
      message: 'تم إرسال البريد الإلكتروني بنجاح',
    };

    return of(response).pipe(delay(800)); // Simulate network delay
  }
}

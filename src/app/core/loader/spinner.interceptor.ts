// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
//   HttpResponse,
//   HttpErrorResponse,
// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { finalize, catchError, tap } from 'rxjs/operators';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { ToastrService } from 'ngx-toastr';

// @Injectable()
// export class SpinnerInterceptor implements HttpInterceptor {
//   private requestCount = 0;

//   //Inject spinner + toastr for error feedback
//   constructor(
//     private spinner: NgxSpinnerService,
//     private toastr: ToastrService
//   ) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     //Skip spinner for specific URLs (assets, auth, etc.)
//     const excludedUrls = ['/assets', '/logout'];
//     // Skip spinner for POST requests
//     const isPost = req.method.toUpperCase() === 'POST';
//     const shouldSkipUrl = excludedUrls.some((url) => req.url.includes(url));

//     const shouldShowSpinner = !shouldSkipUrl && !isPost;

//     if (shouldShowSpinner) {
//       this.showSpinner();
//     }

//     return next.handle(req).pipe(
//       tap((event: HttpEvent<any>) => {
//         if (event instanceof HttpResponse) {
//           //Successful response
//         }
//       }),
//       catchError((error: HttpErrorResponse) => {
//         // Error response
//         if (shouldShowSpinner) {
//           const msg = error?.error?.message || 'حدث خطأ في الاتصال بالسيرفر.';
//           this.toastr.error(msg, 'خطأ');
//         }
//         return throwError(() => error);
//       }),
//       finalize(() => {
//         if (shouldShowSpinner) {
//           this.hideSpinner();
//         }
//       })
//     );
//   }

//   private showSpinner(): void {
//     this.requestCount++;
//     if (this.requestCount === 1) {
//       this.spinner.show();
//     }
//   }

//   private hideSpinner(): void {
//     this.requestCount--;
//     if (this.requestCount === 0) {
//       this.spinner.hide();
//     }
//   }
// }

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // تجاهل requests للـ assets و html
    if (req.url.includes('/assets/') || req.url.endsWith('.html')) {
      return next.handle(req);
    }

    // Check if we're in browser environment before accessing sessionStorage
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token');
    }

    // لو مفيش توكن اطبع warning
    if (!token) {
      console.warn(
        '[INTERCEPTOR] No token found → request sent without auth:',
        req.url
      );
      return next.handle(req);
    }

    const authedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return next.handle(authedReq);
  }
}

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // تجاهل requests للـ assets و html
    if (req.url.includes('/assets/') || req.url.endsWith('.html')) {
      return next.handle(req);
    }

    const token = sessionStorage.getItem('token');

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

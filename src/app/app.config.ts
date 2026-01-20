import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { appRoutes } from './app.routes';
import { SpinnerInterceptor } from './core/loader/spinner.interceptor';
import { AuthTokenInterceptor } from './core/auth-token.interceptor';
import { AuthErrorInterceptor } from './core/guards/auth-error.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { PdfPreviewDialogModule } from './shared/components/pdf-preview-dialog/pdf-preview-dialog.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
    importProvidersFrom(
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
      CanvasJSAngularChartsModule,
      PdfPreviewDialogModule
    ),
  ],
};

import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, Inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  login: string = '';
  password: string = '';
  errorMessage: string = '';
  validationErrors: { [key: string]: string } = {};
  fieldErrors: { [key: string]: string } = {};

  showPassword = false;

  constructor(
    private service: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private notify: NotifyDialogService
  ) {}

  loginUser() {
    this.errorMessage = '';
    this.fieldErrors = {};

    const model = {
      login: this.login,
      password: this.password,
    };

    // this.spinner.show();

    this.service.login(model).subscribe({
      next: (res) => {
        // إظهار dialog نجاح
        this.notify.success({
          title: 'تم تسجيل الدخول',
          description: 'أهلاً بك!',
        });

        if (isPlatformBrowser(this.platformId)) {
          const token =
            res?.data?.tokken ||
            res?.data?.token ||
            res?.token ||
            res?.accessToken ||
            '';
          if (token) {
            const roles =
              Array.isArray(res.data.roles) && res.data.roles.length > 0
                ? res.data.roles
                : ['Admin'];

            // Store user data including userType
            const userData = {
              userType: res.data?.userType || res.data?.userTypeName,
              userTypeName: res.data?.userTypeName,
              ...res.data,
            };

            // Store wellcomeMessage in localStorage for easy access
            if (res.data?.wellcomeMessage) {
              localStorage.setItem('username', res.data.wellcomeMessage);
            }

            // Use the enhanced auth service method with user data
            this.service.setAuthData(token, roles, userData);

            // Redirect based on user type
            this.service.redirectToDashboard();
          } else {
            console.warn('[LOGIN] token key not found in response shape', res);
          }
        }
      },
      error: (err) => {
        this.spinner.hide();

        if (
          err.status === 400 &&
          err.error?.validationErrors &&
          Array.isArray(err.error.validationErrors)
        ) {
          err.error.validationErrors.forEach((e: any) => {
            if (e.errorContext) {
              this.fieldErrors[e.errorContext] = e.errorMessage;
            } else {
              this.errorMessage = e.errorMessage;
            }
          });
        } else if (err.status === 401) {
          this.errorMessage = 'غير مصرح - تحقق من بيانات الدخول.';
        } else if (err.status === 403) {
          this.errorMessage = 'لا تملك صلاحية الوصول.';
        } else if (err.status === 0) {
          this.errorMessage =
            'لا يمكن الاتصال بالسيرفر - تحقق من الاتصال بالإنترنت.';
        } else {
          this.errorMessage = `حدث خطأ أثناء تسجيل الدخول (${err.status}).`;
        }

        // ✅ إظهار dialog خطأ
        this.notify.error({
          title: 'فشل تسجيل الدخول',
          description: this.errorMessage,
          // imageUrl: 'assets/logo_elbatt.png',
          soundUrl: 'assets/sound/Failure_Alert.mp3',
        });
      },
    });
  }

  // =================================== togglePassword =================================

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  logout() {
    this.service.logout();
  }
}

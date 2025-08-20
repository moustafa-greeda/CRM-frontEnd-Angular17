import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Component, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  login: string = '';
  password: string = '';
  errorMessage: string = '';
  validationErrors: { [key: string]: string } = {};

  constructor(
    private service: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  fieldErrors: { [key: string]: string } = {};
  loginUser() {
    this.errorMessage = '';
    this.fieldErrors = {};

    const model = {
      login: this.login,
      password: this.password,
    };

    this.service.login(model).subscribe({
      next: (res) => {
        this.toastr.success('login success');

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.data.tokken);

          const roles =
            Array.isArray(res.data.roles) && res.data.roles.length > 0
              ? res.data.roles
              : ['Customer'];

          localStorage.setItem('roles', JSON.stringify(roles));

          const role = roles[0];
          let redirectUrl = '';

          switch (role) {
            case 'Admin':
              redirectUrl = '/dashboard/admin';
              break;
            case 'Customer':
              redirectUrl = '/dashboard/customer';
              break;
            default:
              redirectUrl = '/dashboard/employee';
          }

          this.router.navigate([redirectUrl]).then(() => {
            this.spinner.hide();
          });
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
        } else {
          this.errorMessage = 'حدث خطأ أثناء تسجيل الدخول.';
        }
      },
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
    }

    this.router.navigate(['/login']);
  }
}

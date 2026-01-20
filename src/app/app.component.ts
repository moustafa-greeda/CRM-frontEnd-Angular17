import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ThemeService } from './core/services/theme.service';
import { PakegsService } from './core/services/common/pakegs.service';
import { NotifyDialogHostComponent } from './shared/components/notify-dialog-host/notify-dialog-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxSpinnerModule, NotifyDialogHostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'ERB ZaWolf';

  constructor(
    private readonly themeService: ThemeService,
    // services
    private _pakegsService: PakegsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Only load packets in browser, not in SSR
    if (isPlatformBrowser(this.platformId)) {
      this._pakegsService.loadPackets();
    }
  }
}

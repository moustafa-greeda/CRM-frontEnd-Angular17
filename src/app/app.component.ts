import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { PakegsService } from './core/services/common/pakegs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
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

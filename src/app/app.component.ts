import { Component } from '@angular/core';
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
    private pakegsService: PakegsService
  ) {}

  ngOnInit() {
    this.pakegsService.loadPackets();
  }
}

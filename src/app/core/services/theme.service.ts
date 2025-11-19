/* ============================================================================
   THEME SERVICE
   ============================================================================
   Service to manage theme (light/dark) and direction (RTL/LTR) switching.
   ============================================================================ */

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';
export type Direction = 'rtl' | 'ltr';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly DIRECTION_KEY = 'direction';

  // Observable subjects for theme and direction
  private themeSubject = new BehaviorSubject<Theme>('light');
  private directionSubject = new BehaviorSubject<Direction>('rtl');

  // Public observables
  public readonly theme$: Observable<Theme> = this.themeSubject.asObservable();
  public readonly direction$: Observable<Direction> =
    this.directionSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      this.initDirection();
    }
  }

  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initTheme(): void {
    if (!this.isBrowser()) return;

    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const systemTheme = this.getSystemTheme();
    const theme = savedTheme || systemTheme;
    this.setTheme(theme, false);
  }

  /**
   * Initialize direction from localStorage or default to RTL
   */
  private initDirection(): void {
    if (!this.isBrowser()) return;

    const savedDirection = localStorage.getItem(
      this.DIRECTION_KEY
    ) as Direction;
    const direction = savedDirection || 'rtl';
    this.setDirection(direction, false);
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): Theme {
    if (!this.isBrowser()) return 'light';

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Set theme (light or dark)
   * @param theme - Theme to apply
   * @param save - Whether to save to localStorage (default: true)
   */
  setTheme(theme: Theme, save: boolean = true): void {
    if (!this.isBrowser()) {
      this.themeSubject.next(theme);
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
    this.themeSubject.next(theme);
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    if (!this.isBrowser()) return 'light';

    return (
      (document.documentElement.getAttribute('data-theme') as Theme) || 'light'
    );
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): Theme {
    const currentTheme = this.getTheme();
    const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Set direction (RTL or LTR)
   * @param direction - Direction to apply
   * @param save - Whether to save to localStorage (default: true)
   */
  setDirection(direction: Direction, save: boolean = true): void {
    if (!this.isBrowser()) {
      this.directionSubject.next(direction);
      return;
    }

    document.documentElement.setAttribute('dir', direction);
    if (save) {
      localStorage.setItem(this.DIRECTION_KEY, direction);
    }
    this.directionSubject.next(direction);
  }

  /**
   * Get current direction
   */
  getDirection(): Direction {
    if (!this.isBrowser()) return 'rtl';

    return (document.documentElement.getAttribute('dir') as Direction) || 'rtl';
  }

  /**
   * Toggle between RTL and LTR
   */
  toggleDirection(): Direction {
    const currentDirection = this.getDirection();
    const newDirection: Direction = currentDirection === 'rtl' ? 'ltr' : 'rtl';
    this.setDirection(newDirection);
    return newDirection;
  }

  /**
   * Listen to system theme changes
   */
  watchSystemTheme(callback: (theme: Theme) => void): void {
    if (!this.isBrowser()) return;

    if (window.matchMedia) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          const theme: Theme = e.matches ? 'dark' : 'light';
          callback(theme);
        });
    }
  }
}

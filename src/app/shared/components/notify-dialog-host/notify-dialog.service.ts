import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type DialogType = 'success' | 'error';

export interface NotifyDialogData {
  type: DialogType;
  title?: string;
  description?: string;
  imageUrl?: string;
  soundUrl?: string;
  iconName?: string;
  autoCloseMs?: number;
  disableBackdropClose?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotifyDialogService {
  readonly state$ = new BehaviorSubject<NotifyDialogData | null>(null);
  private audioCache = new Map<string, HTMLAudioElement>();
  private defaultSuccessSound = 'assets/sound/wolf.mp3';
  private defaultErrorSound = 'assets/sound/Failure_Alert.mp3';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Preload default sounds when service initializes (only in browser)
    if (this.isBrowser) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        this.preloadSound(this.defaultSuccessSound);
        this.preloadSound(this.defaultErrorSound);
      }, 0);
    }
  }

  /**
   * Check if Audio API is available
   */
  private isAudioAvailable(): boolean {
    return this.isBrowser && typeof Audio !== 'undefined';
  }

  /**
   * Preload and cache an audio file
   */
  private preloadSound(url: string): void {
    if (!url || this.audioCache.has(url) || !this.isAudioAvailable()) {
      return;
    }

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;

      // Load the audio immediately
      audio.load();

      // Cache the audio element
      this.audioCache.set(url, audio);

      // Handle errors silently
      audio.addEventListener('error', () => {
        // Failed to preload sound
      });

      // Optional: Preload the audio data
      audio.addEventListener(
        'canplaythrough',
        () => {
          // Audio is ready to play
        },
        { once: true }
      );
    } catch (error) {
      // Error creating audio element
    }
  }

  /**
   * Play a sound from cache or create new audio if not cached
   */
  private playSound(url: string | undefined): void {
    if (!url || !this.isAudioAvailable()) {
      return;
    }

    // Preload if not already cached
    if (!this.audioCache.has(url)) {
      this.preloadSound(url);
    }

    const cachedAudio = this.audioCache.get(url);
    if (cachedAudio) {
      try {
        // Reset audio to start from beginning
        cachedAudio.currentTime = 0;

        // Play immediately
        const playPromise = cachedAudio.play();

        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Failed to play sound
          });
        }
      } catch (error) {
        // Error playing sound
      }
    }
  }

  open(data: NotifyDialogData) {
    // Set default image if not provided
    if (!data.imageUrl) {
      data.imageUrl = 'assets/logo.svg';
    }

    // Play sound immediately (before showing dialog)
    if (data.soundUrl) {
      this.playSound(data.soundUrl);
    }

    this.state$.next(data);
    return { close: () => this.close() };
  }

  close() {
    this.state$.next(null);
  }

  success(opts: Omit<NotifyDialogData, 'type' | 'iconName'>) {
    const soundUrl = opts.soundUrl ?? this.defaultSuccessSound;
    // Preload the sound if not already cached
    this.preloadSound(soundUrl);

    return this.open({
      type: 'success',
      title: opts.title ?? 'نجاح',
      iconName: 'bi:check-circle-fill',
      imageUrl: opts.imageUrl ?? 'assets/logo.svg',
      soundUrl: soundUrl,
      disableBackdropClose: opts.disableBackdropClose ?? false,
      autoCloseMs: opts.autoCloseMs ?? 3000,
      ...opts, // Spread opts after defaults to allow overriding
    });
  }

  error(opts: Omit<NotifyDialogData, 'type' | 'iconName'>) {
    const soundUrl = opts.soundUrl ?? this.defaultErrorSound;
    // Preload the sound if not already cached
    this.preloadSound(soundUrl);

    return this.open({
      type: 'error',
      title: opts.title ?? 'خطأ',
      iconName: 'bi:x-circle-fill',
      imageUrl: opts.imageUrl ?? 'assets/logo.svg',
      soundUrl: soundUrl,
      disableBackdropClose: opts.disableBackdropClose ?? false,
      autoCloseMs: opts.autoCloseMs ?? 3000,
      ...opts, // Spread opts after defaults to allow overriding
    });
  }
}

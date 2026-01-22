import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterOutlet,
  Router,
  NavigationEnd,
} from '@angular/router';
import { IFollowUpPersonal } from '../interfaces/IFollowUp';
import { FollowupDetailsService } from './followup-details.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-details-follow-up-tele',
  templateUrl: './details-follow-up-tele.component.html',
  styleUrl: './details-follow-up-tele.component.css',
})
export class DetailsFollowUpTeleComponent implements OnInit, AfterViewInit {
  pageTitle = 'تفاصيل المتابعة';
  breadcrumb: { label: string; link: string }[] = [];
  contactId: number = 0;
  details: IFollowUpPersonal | null = null;
  isLoading: boolean = false;
  ninjaPosition: { left: string; top: string } = { left: '0px', top: '0px' };
  activeTabIndex: number = 0;
  isJumping: boolean = false;
  private jumpSound: HTMLAudioElement;

  @ViewChildren('tabButton') tabButtons!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _followupDetailsService: FollowupDetailsService
  ) {
    this.contactId = this.route.snapshot.params['contactId'];
    this.updateBreadcrumb();
    // Initialize jump sound
    this.jumpSound = new Audio('assets/sound/jump.mp3');
    this.jumpSound.volume = 0.5; // Set volume to 50%
    this.jumpSound.preload = 'auto';
  }

  private updateBreadcrumb(): void {
    this.breadcrumb = [
      { label: 'الرئيسية', link: '/dashboard/telesales' },
      { label: 'المتابعة', link: '/dashboard/telesales/follow-up-tele' },
      {
        label: 'تفاصيل المتابعة',
        link: `/dashboard/telesales/follow-up-tele/view/${this.contactId}`,
      },
    ];
  }

  ngOnInit(): void {
    this.getDetails();
    this.updateActiveTab();

    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.updateActiveTab(), 100);
      });
  }

  ngAfterViewInit(): void {
    // Update position after view initialization
    setTimeout(() => {
      this.updateActiveTab();
      // Also update when tab buttons are available
      this.tabButtons.changes.subscribe(() => {
        setTimeout(() => this.updateActiveTab(), 100);
      });
    }, 100);
  }

  updateActiveTab(): void {
    const currentUrl = this.router.url;
    const tabRoutes = ['activiteis', 'notes', 'calls', 'files', 'mails'];

    // Find which tab is active based on current route
    const activeIndex = tabRoutes.findIndex((route) =>
      currentUrl.includes(route)
    );

    if (activeIndex !== -1) {
      this.activeTabIndex = activeIndex;
      this.updateNinjaPosition();
    } else {
      // Default to first tab if no match
      this.activeTabIndex = 0;
      this.updateNinjaPosition();
    }
  }

  updateNinjaPosition(): void {
    setTimeout(() => {
      if (this.tabButtons && this.tabButtons.length > 0) {
        const activeButton = this.tabButtons.toArray()[this.activeTabIndex];
        if (activeButton && activeButton.nativeElement) {
          const buttonElement = activeButton.nativeElement;
          const containerTab = buttonElement.closest('.container-tab');

          if (containerTab) {
            const containerRect = containerTab.getBoundingClientRect();
            const buttonRect = buttonElement.getBoundingClientRect();

            // Calculate position relative to container
            // Center the ninja on the button (transform: translateX(-50%) centers it)
            const left =
              buttonRect.left - containerRect.left + buttonRect.width / 2;
            // Position at the top of the container (above the tabs)
            const top = 50; // Fixed position at top of container

            // Trigger jump animation
            this.isJumping = true;
            this.playJumpSound();
            setTimeout(() => {
              this.isJumping = false;
            }, 600); // Animation duration

            this.ninjaPosition = {
              left: `${left}px`,
              top: `${top}px`,
            };
          }
        }
      }
    }, 50);
  }

  getDetails(): void {
    this.isLoading = true;
    this._followupDetailsService
      .getFollowUpDetailsById(this.contactId.toString())
      .subscribe({
        next: (res: any) => {
          // Handle array or single object response
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.details = res.data[0];
          } else if (res.data && !Array.isArray(res.data)) {
            this.details = res.data;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading details:', error);
          this.isLoading = false;
        },
      });
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    if (!dateString) return 'غير متوفر';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Helper method to get gender in Arabic
  getGenderText(gender: string): string {
    if (!gender) return 'غير محدد';
    const genderMap: { [key: string]: string } = {
      Male: 'ذكر',
      male: 'ذكر',
      Female: 'أنثى',
      female: 'أنثى',
      ذكر: 'ذكر',
      أنثى: 'أنثى',
    };
    return genderMap[gender] || gender;
  }

  // Prepare route for animation
  prepareRoute(outlet: RouterOutlet) {
    const route = outlet?.activatedRoute;
    return route
      ? route.snapshot.url.map((segment) => segment.path).join('/') || 'default'
      : 'default';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateNinjaPosition();
  }

  private playJumpSound(): void {
    try {
      // Reset audio to start
      this.jumpSound.currentTime = 0;
      // Play the sound
      this.jumpSound.play().catch((error) => {
        // Handle autoplay restrictions (browsers may block autoplay)
        console.log('Could not play jump sound:', error);
      });
    } catch (error) {
      console.log('Error playing jump sound:', error);
    }
  }
}

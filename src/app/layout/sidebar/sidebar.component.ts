import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { SidebarService } from './sidebar.service';
import { UserRole } from '../../core/Models/user/user.model';
import { SidebarItem } from '../../core/Models/sidbar/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  menuItems: SidebarItem[] = [];

  @Input() isCollapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  roles: string[] = [];
  userType: string | null = null;
  employeeOpen = false;

  onToggle() {
    this.toggleCollapse.emit();
  }

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.roles = this.authService.getUserRoles();
      this.userType = this.authService.getUserType();
      this.menuItems = this.sidebarService.getMenu(this.userType as UserRole);
    }
  }
}

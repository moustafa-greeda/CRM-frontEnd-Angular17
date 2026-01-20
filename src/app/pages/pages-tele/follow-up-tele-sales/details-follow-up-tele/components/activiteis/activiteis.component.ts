import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DashboardTeleService } from '../../../../../../dashboard/dashboard-telesales/dashboard.service';
import {
  ITeleSalseActionResponse,
  ITeleSalseAction,
  IRecentInteraction,
} from '../../../../../../core/Models/teleSalse/itele-salse-action';
import { AuthService } from '../../../../../../Auth/auth.service';
import { RecentInteractionsComponent } from '../../../../../../shared/components/recent-interactions/recent-interactions.component';

@Component({
  selector: 'app-activiteis',
  standalone: true,
  imports: [CommonModule, RouterModule, RecentInteractionsComponent],
  templateUrl: './activiteis.component.html',
  styleUrl: './activiteis.component.css',
})

export class ActiviteisComponent implements OnInit {
  contactId: number = 0;
  contactName: string = '';
  recentInteractions: IRecentInteraction[] = [];
  loadingActions: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private _authService: AuthService,
    private _dashboardService: DashboardTeleService
  ) {}

  ngOnInit(): void {
    this.contactId = this.route.snapshot.params['contactId'];
    this.loadTeleSalesActions();
  }

  loadTeleSalesActions(
    employeeId: number = this._authService.getEmployeeId() || 0,
    startDate?: string,
    endDate?: string
  ): void {
    this.loadingActions = true;
    this._dashboardService
      .getTeleSalesActions(employeeId, startDate, undefined, endDate)
      .subscribe({
        next: (response: ITeleSalseActionResponse) => {
          if (response.succeeded && response.data) {
            // Convert ITeleSalseActionResponse to IRecentInteraction[]
            this.recentInteractions = this.convertActionsToInteractions(
              response.data.actionsGrouped
            );
          }
          this.loadingActions = false;
        },
        error: (error: any) => {
          console.error('Error loading tele sales actions:', error);
          this.loadingActions = false;
        },
      });
  }

  private convertActionsToInteractions(
    actionsGrouped: any[]
  ): IRecentInteraction[] {
    const interactions: IRecentInteraction[] = [];

    if (!actionsGrouped || !Array.isArray(actionsGrouped)) {
      return interactions;
    }

    actionsGrouped.forEach((group) => {
      if (group.actions && Array.isArray(group.actions)) {
        group.actions.forEach((action: ITeleSalseAction) => {
          interactions.push({
            // contactName: this.contactName || '',
            actionId: action.id,
            actionTime: action.actionDate || action.createdAt,
            actionType: action.actionTypeName || group.actionTypeName,
            actionText: action.actionNotes || '',
          });
        });
      }
    });

    // Sort by actionTime (newest first)
    return interactions.sort((a, b) => {
      return (
        new Date(b.actionTime).getTime() - new Date(a.actionTime).getTime()
      );
    });
  }
}

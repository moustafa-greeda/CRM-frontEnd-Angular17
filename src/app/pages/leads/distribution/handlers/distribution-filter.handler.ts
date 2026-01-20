import { DistributionStateHandler } from './distribution-state.handler';
import { DistributionService } from '../distribution.service';
import { NotifyDialogService } from '../../../../shared/components/notify-dialog-host/notify-dialog.service';

/**
 * Handler for managing filter logic and data fetching
 */
export class DistributionFilterHandler {
  constructor(
    private state: DistributionStateHandler,
    private service: DistributionService,
    private notify: NotifyDialogService
  ) {}

  /**
   * Get assignment filter parameter for API
   */
  getAssignmentFilterParam(): boolean | undefined {
    const filter = this.state.assignmentFilter();
    if (filter === 'العملاء المخصصين') {
      return true;
    } else if (filter === 'العملاء غير المخصصين') {
      return false;
    }
    return undefined;
  }

  /**
   * Load all tele sales employees
   */
  loadTeleSalse(): void {
    this.service.getAllTeleSalse().subscribe({
      next: (response) => {
        this.state.teleSalseList.set(response.data || []);
      },
      error: (error) => {
        console.error('getAllTeleSalse failed', error);
        this.notify.open({
          type: 'error',
          title: 'فشل تحميل الموظفين',
          description: 'حدث خطأ أثناء تحميل الموظفين',
        });
      },
    });
  }

  /**
   * Load all leads with current filters
   */
  loadLeads(): void {
    const assignmentParam = this.getAssignmentFilterParam();

    this.service
      .getAllLeads(
        this.state.currentPage(),
        this.state.pageSize(),
        this.state.searchTerm(),
        assignmentParam
      )
      .subscribe({
        next: (response) => {
          if (response && response.succeeded && response.data) {
            this.state.leadsList.set(response.data.items || []);
            this.state.totalCount.set(response.data.totalCount || 0);
          } else {
            this.state.leadsList.set([]);
            this.state.totalCount.set(0);
            this.notify.open({
              type: 'error',
              title: 'فشل تحميل العملاء',
              description: response?.message || 'حدث خطأ أثناء تحميل العملاء',
            });
          }
        },
        error: (error) => {
          console.error('Error loading leads:', error);
          this.state.leadsList.set([]);
          this.state.totalCount.set(0);
          this.notify.open({
            type: 'error',
            title: 'فشل تحميل العملاء',
            description: 'حدث خطأ أثناء تحميل العملاء',
          });
        },
      });
  }

  /**
   * Handle search term change
   */
  onSearchChange(searchTerm: string): void {
    this.state.searchTerm.set(searchTerm);
    this.state.currentPage.set(1);
    this.loadLeads();
  }

  /**
   * Handle assignment filter change
   */
  onAssignmentFilterChange(filter: string): void {
    this.state.assignmentFilter.set(filter);
    this.state.currentPage.set(1);
    this.loadLeads();
  }

  /**
   * Handle page change
   */
  onPageChange(pageIndex: number): void {
    if (this.state.totalCount() === 0) {
      return;
    }
    this.state.currentPage.set(pageIndex + 1);
    this.loadLeads();
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(newPageSize: number): void {
    this.state.pageSize.set(newPageSize);
    this.state.currentPage.set(1);
    this.loadLeads();
  }
}

import {
  AfterViewInit,
  Component,
  Inject,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { GetAllCompaniseService } from '../../../../../../core/services/common/get-all-companise.service';
import { ICompanies } from '../../../../../../core/Models/common/icompanies';

export interface CompanyLookupDialogData {
  selectedCompanyId?: number | null;
}

// Export type alias for backward compatibility
export type CompanyLookupRecord = ICompanies;

@Component({
  selector: 'app-company-lookup-dialog',
  templateUrl: './company-lookup-dialog.component.html',
  styleUrls: ['./company-lookup-dialog.component.css'],
})
export class CompanyLookupDialogComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  displayedColumns: string[] = ['name'];
  dataSource = new MatTableDataSource<ICompanies>([]);
  searchTerm = '';
  selectedCompanyId: number | null = null;
  private selectedCompany: ICompanies | null = null;

  // Pagination properties
  totalCount = 0;
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [10, 50, 100, 500, 1000];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private isUpdatingPaginator = false;

  constructor(
    private dialogRef: MatDialogRef<CompanyLookupDialogComponent>,
    private _getAllCompaniseService: GetAllCompaniseService,
    @Inject(MAT_DIALOG_DATA) public data: CompanyLookupDialogData,
    private cdr: ChangeDetectorRef
  ) {
    if (data?.selectedCompanyId) {
      this.selectedCompanyId = data.selectedCompanyId;
    }
  }

  ngOnInit(): void {
    // Set up filter predicate for client-side filtering
    this.dataSource.filterPredicate = (data: ICompanies, filter: string) => {
      const normalizedFilter = filter.trim().toLowerCase();
      if (!normalizedFilter) return true;
      return data.name?.toLowerCase().includes(normalizedFilter) || false;
    };
  }

  ngAfterViewInit(): void {
    // Initialize paginator with current values
    if (this.paginator) {
      this.paginator.length = this.totalCount;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
    }

    // Load initial data after paginator is set up
    this.loadCompanies();
  }

  // Handle page change event from template
  onPageChange(event: PageEvent): void {
    // Prevent recursive calls when we update paginator programmatically
    if (this.isUpdatingPaginator) {
      return;
    }

    // Check if page size changed BEFORE updating
    const pageSizeChanged = event.pageSize !== this.pageSize;
    const oldPageSize = this.pageSize;
    const oldPageIndex = this.pageIndex;

    // Update page size and index from the event FIRST
    this.pageSize = event.pageSize;

    // If page size changed, reset to first page
    if (pageSizeChanged) {
      this.pageIndex = 0;
    } else {
      this.pageIndex = event.pageIndex;
    }

    // Load companies with new pagination parameters
    // This ensures the API is called with the correct values
    this.loadCompanies();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // =========================== get all companise ===========================
  loadCompanies(): void {
    this.isLoading = true;
    const currentPage = this.pageIndex + 1; // API uses 1-based indexing

    this._getAllCompaniseService
      .getAllCompanise(currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            this.dataSource.data = res.data.items || [];
            this.totalCount = res.data.totalCount || 0;

            // Reapply filter if search term exists
            if (this.searchTerm.trim()) {
              this.dataSource.filter = this.searchTerm.trim().toLowerCase();
            }

            // Update paginator properties to keep in sync (without triggering events)
            if (this.paginator) {
              this.isUpdatingPaginator = true;

              // Only update if values actually changed to avoid unnecessary updates
              if (this.paginator.length !== this.totalCount) {
                this.paginator.length = this.totalCount;
              }
              if (this.paginator.pageIndex !== this.pageIndex) {
                this.paginator.pageIndex = this.pageIndex;
              }
              if (this.paginator.pageSize !== this.pageSize) {
                this.paginator.pageSize = this.pageSize;
              }

              // Force change detection
              this.cdr.detectChanges();

              // Use setTimeout to reset flag after Angular's change detection
              // Increased timeout to ensure all updates are complete
              setTimeout(() => {
                this.isUpdatingPaginator = false;
              }, 50);
            }

            // If there's a pre-selected company, find and select it
            if (this.selectedCompanyId && !this.selectedCompany) {
              const match = this.dataSource.data.find(
                (company: ICompanies) => company.id === this.selectedCompanyId
              );
              if (match) {
                this.selectedCompany = match;
              }
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading companies:', error);
          this.isLoading = false;
        },
      });
  }

  applyFilter(value: string): void {
    this.searchTerm = value;

    // Reset to first page when filtering
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    // Apply client-side filter to current page results
    const normalized = value.trim().toLowerCase();
    if (normalized) {
      this.dataSource.filter = normalized;
    } else {
      this.dataSource.filter = '';
    }
  }

  selectCompany(company: ICompanies): void {
    this.selectedCompanyId = company.id || null;
    this.selectedCompany = company;
  }

  confirmSelection(): void {
    if (this.selectedCompany) {
      this.dialogRef.close(this.selectedCompany);
    }
  }

  onClose(): void {
    this.dialogRef.close(null);
  }
}

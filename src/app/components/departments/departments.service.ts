import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IDepartments } from '../../core/Models/departments/idepartments.model';
import { catchError, map, of } from 'rxjs';

interface PagedResponse<T> {
  data: { items: T[]; totalCount: number };
}

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  // Base API URL from environment configuration
  private BASE_API_URL = environment.apiUrl;

  // Internal BehaviorSubject to store the list of departments
  private departmentsSubject = new BehaviorSubject<IDepartments[]>([]);

  // Public observable for components to subscribe to department data
  public departments$ = this.departmentsSubject.asObservable();

  // Internal BehaviorSubject to store the total count of departments
  private totalCountSubject = new BehaviorSubject<number>(0);

  // Public observable for components to subscribe to the total count
  public totalCount$ = this.totalCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetches a paged and optionally filtered/sorted list of departments.
   * Updates `departments$` and `totalCount$` streams when data is received.
   *
   * params - Optional query parameters for pagination, sorting, and filtering
   */
  getAll(
    params: {
      pageIndex?: number;
      pageSize?: number;
      SortField?: string;
      SortDirection?: 'asc' | 'desc' | '';
      Name?: string;
      Description?: string;
      SearchKeyword?: string;
      Id?: number;
    } = {}
  ) {
    let httpParams = new HttpParams();

    // Append pagination parameters
    if (params.pageIndex != null)
      httpParams = httpParams.set('PageIndex', String(params.pageIndex));
    if (params.pageSize != null)
      httpParams = httpParams.set('PageSize', String(params.pageSize));

    // Append sorting parameters
    if (params.SortField)
      httpParams = httpParams.set('SortField', params.SortField);
    if (params.SortDirection)
      httpParams = httpParams.set('SortDirection', params.SortDirection);

    // Append filter parameters
    if (params.Name) httpParams = httpParams.set('Name', params.Name);
    if (params.Description)
      httpParams = httpParams.set('Description', params.Description);
    if (params.SearchKeyword)
      httpParams = httpParams.set('SearchKeyword', params.SearchKeyword);
    if (params.Id != null) httpParams = httpParams.set('Id', String(params.Id));

    // Make HTTP GET request and update BehaviorSubjects
    return (
      this.http
        .get<PagedResponse<IDepartments>>(`${this.BASE_API_URL}/Department`, {
          params: httpParams,
        })
        // .pipe(
        //   tap((res) => {
        //     this.departmentsSubject.next(res.data.items);
        //     this.totalCountSubject.next(res.data.totalCount);
        //   })
        // );
        .pipe(
          // حوّل أي body غير متوقّع لقيمة آمنة
          map((res) => {
            const items = res?.data?.items ?? [];
            const total = res?.data?.totalCount ?? 0;
            return { items, total };
          }),
          // برضه لو حصل خطأ HTTP رجّع فاضي بدل ما يكسر الصفحة
          catchError(() => of({ items: [], total: 0 })),
          tap(({ items, total }) => {
            this.departmentsSubject.next(items);
            this.totalCountSubject.next(total);
          })
        )
    );
  }

  /**
   * Convenience method to refresh the department list
   * by calling `getAll()` and auto-subscribing.
   */
  refreshDepartments(params?: {
    pageIndex?: number;
    pageSize?: number;
    SortField?: string;
    SortDirection?: 'asc' | 'desc' | '';
    Name?: string;
    Description?: string;
    SearchKeyword?: string;
    Id?: number;
  }): void {
    this.getAll(params).subscribe();
  }

  /**
   * Fetches a single department by its ID.
   */
  getById(id: number): Observable<IDepartments> {
    return this.http.get<IDepartments>(`${this.BASE_API_URL}/Department/${id}`);
  }

  /**
   * Adds a new department.
   * Automatically refreshes the list after adding.
   */
  add(department: IDepartments): Observable<IDepartments> {
    return this.http
      .post<IDepartments>(`${this.BASE_API_URL}/Department`, department)
      .pipe(tap(() => this.refreshDepartments()));
  }

  /**
   * Updates an existing department.
   * According to the Swagger spec, PUT uses query parameters.
   *
   * param id - Department ID
   * param department - Partial object containing updated fields
   */
  update(id: number, department: Partial<IDepartments>): Observable<any> {
    let params = new HttpParams().set('Id', id);

    if (department.name) params = params.set('Name', department.name);
    if (department.description)
      params = params.set('Description', department.description);

    return this.http
      .put(`${this.BASE_API_URL}/Department`, null, { params })
      .pipe(tap(() => this.refreshDepartments()));
  }

  /**
   * Deletes a department by ID.
   * Automatically refreshes the list after deletion.
   */
  delete(id: number): Observable<any> {
    return this.http
      .delete(`${this.BASE_API_URL}/Department/${id}`)
      .pipe(tap(() => this.refreshDepartments()));
  }
}

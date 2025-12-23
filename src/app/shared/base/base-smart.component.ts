import { Directive, signal, computed, effect, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/**
 * TItem      → نوع العنصر (Employee, Lead, ...)
 * TFilters   → نوع الفلاتر
 * TFormData  → نوع الفورم (Add / Edit)
 */
@Directive()
export abstract class BaseSmartComponent<
  TItem,
  TFilters = any,
  TFormData = any
> {
  /* ===================== STATE (Signals) ===================== */

  /** القائمة */
  readonly items = signal<TItem[]>([]);

  /** loading */
  readonly loading = signal<boolean>(false);

  /** search */
  readonly searchTerm = signal<string>('');

  /** filters */
  readonly filters = signal<TFilters>({} as TFilters);

  /** selected item (edit) */
  readonly selectedItem = signal<TItem | null>(null);

  /** computed */
  readonly hasItems = computed(() => this.items().length > 0);

  /* ===================== SERVICES ===================== */

  protected dialog = inject(MatDialog);

  constructor() {
    /** auto reload when search / filters change */
    effect(() => {
      this.searchTerm();
      this.filters();
      this.load();
    });
  }

  /* ===================== ABSTRACT METHODS ===================== */

  /** تحميل الداتا */
  protected abstract fetch(search: string, filters: TFilters): Promise<TItem[]>;

  /** create */
  protected abstract create(data: TFormData): Promise<TItem>;

  /** update */
  protected abstract update(id: number, data: TFormData): Promise<TItem>;

  /** delete */
  protected abstract delete(id: number): Promise<void>;

  /** استخراج ID */
  protected abstract getItemId(item: TItem): number;

  /* ===================== PUBLIC ACTIONS ===================== */

  load(): void {
    this.loading.set(true);

    this.fetch(this.searchTerm(), this.filters())
      .then((data) => {
        this.items.set(data);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  setFilters(filters: Partial<TFilters>): void {
    this.filters.set({
      ...this.filters(),
      ...filters,
    });
  }

  /* ===================== ADD ===================== */

  onAdd(formData: TFormData): void {
    this.loading.set(true);

    this.create(formData)
      .then((created) => {
        this.items.set([created, ...this.items()]);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  /* ===================== EDIT ===================== */

  onEdit(item: TItem, formData: TFormData): void {
    const id = this.getItemId(item);
    this.loading.set(true);

    this.update(id, formData)
      .then((updated) => {
        const updatedList = this.items().map((i) =>
          this.getItemId(i) === id ? updated : i
        );
        this.items.set(updatedList);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  /* ===================== DELETE ===================== */

  onDelete(item: TItem): void {
    const id = this.getItemId(item);
    this.loading.set(true);

    this.delete(id)
      .then(() => {
        this.items.set(this.items().filter((i) => this.getItemId(i) !== id));
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}

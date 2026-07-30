import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ProductDialogComponent,
  ProductDialogData,
  ProductDialogResult
} from './product-dialog/product-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../environments/environment';

type PriceSortOption = '' | 'asc' | 'desc';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;

  readonly displayedColumns = ['image', 'name', 'category_name', 'price', 'actions'];
  readonly products = signal<Product[]>([]);
  readonly totalCount = signal(0);
  readonly loading = signal(false);
  readonly categories = signal<Category[]>([]);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly categoryFilterControl = new FormControl<number | null>(null);

  /** Dedicated "Sort by Price" dropdown, per assignment requirement. */
  readonly priceSortControl = new FormControl<PriceSortOption>('', { nonNullable: true });

  readonly priceSortOptions: { value: PriceSortOption; label: string }[] = [
    { value: '', label: 'Default' },
    { value: 'asc', label: 'Price: Low to High' },
    { value: 'desc', label: 'Price: High to Low' }
  ];

  pageIndex = 0;
  pageSize = 10;
  sort: 'name' | 'price' | 'created_at' = 'created_at';
  order: 'asc' | 'desc' = 'desc';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.categoryService.list().subscribe((categories) => this.categories.set(categories));
    this.fetchProducts();

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.fetchProducts();
      });

    this.categoryFilterControl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.fetchProducts();
    });

    this.priceSortControl.valueChanges.subscribe((value) => this.applyPriceSort(value));
  }

  fetchProducts(): void {
    this.loading.set(true);
    this.productService
      .list({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        search: this.searchControl.value || undefined,
        categoryId: this.categoryFilterControl.value ?? undefined,
        sort: this.sort,
        order: this.order
      })
      .subscribe({
        next: (result) => {
          this.products.set(result.items);
          this.totalCount.set(result.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProducts();
  }

  /** Handles clicking the sortable "Name" column header. */
  onSortChange(sortEvent: Sort): void {
    if (!sortEvent.active || sortEvent.direction === '') {
      this.sort = 'created_at';
      this.order = 'desc';
    } else {
      this.sort = sortEvent.active as 'name' | 'price' | 'created_at';
      this.order = sortEvent.direction === 'asc' ? 'asc' : 'desc';
    }

    // Column-header sorting and the price dropdown are mutually exclusive
    // views of the same server-side sort state, so keep them in sync.
    this.priceSortControl.setValue(this.sort === 'price' ? this.order : '', { emitEvent: false });

    this.pageIndex = 0;
    this.fetchProducts();
  }

  /** Handles the required "Sort by Price" dropdown (asc/desc/default). */
  private applyPriceSort(value: PriceSortOption): void {
    if (value === '') {
      this.sort = 'created_at';
      this.order = 'desc';
    } else {
      this.sort = 'price';
      this.order = value;
    }

    // Clear any active column-header sort indicator so the UI doesn't show
    // two conflicting sort states at once.
    if (this.matSort) {
      this.matSort.active = '';
      this.matSort.direction = '';
    }

    this.pageIndex = 0;
    this.fetchProducts();
  }

  resolveImageUrl(path: string | null): string | null {
    if (!path) return null;
    const origin = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${origin}${path}`;
  }

  openAddDialog(): void {
    const ref = this.dialog.open<ProductDialogComponent, ProductDialogData>(ProductDialogComponent, {
      width: '480px',
      data: { product: null, categories: this.categories() }
    });

    ref.afterClosed().subscribe((result: ProductDialogResult | null) => {
      if (!result) return;
      this.productService.create(result.value, result.image).subscribe({
        next: () => {
          this.notification.success('Product added successfully');
          this.fetchProducts();
        }
      });
    });
  }

  openEditDialog(product: Product): void {
    const ref = this.dialog.open<ProductDialogComponent, ProductDialogData>(ProductDialogComponent, {
      width: '480px',
      data: { product, categories: this.categories() }
    });

    ref.afterClosed().subscribe((result: ProductDialogResult | null) => {
      if (!result) return;
      this.productService.update(product.id, result.value, result.image).subscribe({
        next: () => {
          this.notification.success('Product updated successfully');
          this.fetchProducts();
        }
      });
    });
  }

  confirmDelete(product: Product): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"? This cannot be undone.`
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.productService.delete(product.id).subscribe({
        next: () => {
          this.notification.success('Product deleted successfully');
          this.fetchProducts();
        }
      });
    });
  }
}
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { Category, CategoryPayload } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { CategoryDialogComponent, CategoryDialogData } from './category-dialog/category-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  readonly displayedColumns = ['id', 'name', 'created_at', 'actions'];
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);

  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor(
    private categoryService: CategoryService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchCategories();

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => this.fetchCategories());
  }

  fetchCategories(): void {
    this.loading.set(true);
    this.categoryService.list(this.searchControl.value).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open<CategoryDialogComponent, CategoryDialogData>(
      CategoryDialogComponent,
      { width: '420px', data: { category: null } }
    );

    ref.afterClosed().subscribe((result: CategoryPayload | null) => {
      if (!result) return;
      this.categoryService.create(result).subscribe({
        next: () => {
          this.notification.success('Category added successfully');
          this.fetchCategories();
        }
      });
    });
  }

  openEditDialog(category: Category): void {
    const ref = this.dialog.open<CategoryDialogComponent, CategoryDialogData>(
      CategoryDialogComponent,
      { width: '420px', data: { category } }
    );

    ref.afterClosed().subscribe((result: CategoryPayload | null) => {
      if (!result) return;
      this.categoryService.update(category.id, result).subscribe({
        next: () => {
          this.notification.success('Category updated successfully');
          this.fetchCategories();
        }
      });
    });
  }

  confirmDelete(category: Category): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete "${category.name}"? This cannot be undone.`
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.categoryService.delete(category.id).subscribe({
        next: () => {
          this.notification.success('Category deleted successfully');
          this.fetchCategories();
        }
      });
    });
  }
}
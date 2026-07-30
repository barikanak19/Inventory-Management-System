import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { ReportService } from '../../core/services/report.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  readonly categories = signal<Category[]>([]);
  readonly downloadingCsv = signal(false);
  readonly downloadingXlsx = signal(false);

  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private reportService: ReportService,
    private notification: NotificationService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      categoryId: [null as number | null]
    });
  }

  ngOnInit(): void {
    this.categoryService.list().subscribe((categories) => this.categories.set(categories));
  }

  download(format: 'csv' | 'xlsx'): void {
    const { search, categoryId } = this.filterForm.getRawValue();
    const busySignal = format === 'csv' ? this.downloadingCsv : this.downloadingXlsx;
    busySignal.set(true);

    this.reportService
      .download({ format, search: search || undefined, categoryId })
      .pipe(finalize(() => busySignal.set(false)))
      .subscribe({
        next: (blob) => {
          const filename = `products-report.${format}`;
          this.reportService.saveBlob(blob, filename);
          this.notification.success('Report downloaded successfully');
        }
      });
  }
}
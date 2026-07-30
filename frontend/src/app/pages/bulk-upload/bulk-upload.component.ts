import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { BulkUploadService } from '../../core/services/bulk-upload.service';
import { NotificationService } from '../../core/services/notification.service';
import { UploadSummary } from '../../core/models/upload-summary.model';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule
  ],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent {
  readonly selectedFile = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly progress = signal(0);
  readonly summary = signal<UploadSummary | null>(null);
  readonly errorColumns = ['row', 'message'];

  constructor(
    private bulkUploadService: BulkUploadService,
    private notification: NotificationService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validExtensions = ['.csv', '.xlsx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      this.notification.error('Please select a .csv or .xlsx file');
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
    this.summary.set(null);
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.summary.set(null);
    this.progress.set(0);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.progress.set(0);
    this.summary.set(null);

    this.bulkUploadService.upload(file).subscribe({
      next: (event) => {
        if (event.type === 'progress') {
          this.progress.set(event.percent);
        } else {
          this.uploading.set(false);
          this.summary.set(event.summary);
          if (event.summary.failedCount === 0) {
            this.notification.success(
              `All ${event.summary.successCount} rows uploaded successfully`
            );
          } else {
            this.notification.info(
              `Uploaded ${event.summary.successCount} rows, ${event.summary.failedCount} failed`
            );
          }
        }
      },
      error: () => {
        this.uploading.set(false);
        this.progress.set(0);
      }
    });
  }
}
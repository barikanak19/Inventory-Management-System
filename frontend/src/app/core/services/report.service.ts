import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportFilters {
  format: 'csv' | 'xlsx';
  search?: string;
  categoryId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly url = `${environment.apiUrl}/reports/products`;

  constructor(private http: HttpClient) {}

  download(filters: ReportFilters): Observable<Blob> {
    let params = new HttpParams().set('format', filters.format);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', String(filters.categoryId));

    return this.http.get(this.url, { params, responseType: 'blob' });
  }

  saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }
}
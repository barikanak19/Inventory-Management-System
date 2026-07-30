import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UploadSummary } from '../models/upload-summary.model';

export type UploadProgressEvent =
  | { type: 'progress'; percent: number }
  | { type: 'done'; summary: UploadSummary };

@Injectable({ providedIn: 'root' })
export class BulkUploadService {
  private readonly url = `${environment.apiUrl}/products/bulk-upload`;

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<UploadProgressEvent> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', this.url, formData, {
      reportProgress: true
    });

    return this.http.request<ApiResponse<UploadSummary>>(req).pipe(
      filter(
        (event: HttpEvent<ApiResponse<UploadSummary>>) =>
          event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response
      ),
      map((event): UploadProgressEvent => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { type: 'progress', percent };
        }
        const body = (event as any).body as ApiResponse<UploadSummary>;
        return { type: 'done', summary: body.data as UploadSummary };
      })
    );
  }
}
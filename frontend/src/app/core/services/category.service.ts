import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, CategoryPayload } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  list(search?: string): Observable<Category[]> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;

    return this.http
      .get<ApiResponse<Category[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data ?? []));
  }

  getById(id: number): Observable<Category> {
    return this.http
      .get<ApiResponse<Category>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data as Category));
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(this.baseUrl, payload)
      .pipe(map((res) => res.data as Category));
  }

  update(id: number, payload: CategoryPayload): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data as Category));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}
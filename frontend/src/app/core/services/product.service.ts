import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedData } from '../models/api-response.model';
import { Product, ProductFormValue, ProductQueryParams } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  list(query: ProductQueryParams): Observable<PaginatedData<Product>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 10));

    if (query.search) params = params.set('search', query.search);
    if (query.categoryId) params = params.set('categoryId', String(query.categoryId));
    if (query.sort) params = params.set('sort', query.sort);
    if (query.order) params = params.set('order', query.order);

    return this.http
      .get<ApiResponse<PaginatedData<Product>>>(this.baseUrl, { params })
      .pipe(map((res) => res.data as PaginatedData<Product>));
  }

  getById(id: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data as Product));
  }

  create(payload: ProductFormValue, image?: File | null): Observable<Product> {
    const formData = this.toFormData(payload, image);
    return this.http
      .post<ApiResponse<Product>>(this.baseUrl, formData)
      .pipe(map((res) => res.data as Product));
  }

  update(id: number, payload: ProductFormValue, image?: File | null): Observable<Product> {
    const formData = this.toFormData(payload, image);
    return this.http
      .put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, formData)
      .pipe(map((res) => res.data as Product));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }

  private toFormData(payload: ProductFormValue, image?: File | null): FormData {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('price', String(payload.price));
    formData.append('categoryId', String(payload.categoryId));
    if (image) {
      formData.append('image', image, image.name);
    }
    return formData;
  }
}
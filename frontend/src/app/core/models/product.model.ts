export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name: string;
  image_path: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormValue {
  name: string;
  price: number;
  categoryId: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | null;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}
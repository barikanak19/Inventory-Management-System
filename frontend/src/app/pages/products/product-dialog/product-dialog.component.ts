import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../../core/models/category.model';
import { Product, ProductFormValue } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

export interface ProductDialogData {
  product: Product | null;
  categories: Category[];
}

export interface ProductDialogResult {
  value: ProductFormValue;
  image: File | null;
}

const MAX_IMAGE_SIZE_MB = 5;

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss'
})
export class ProductDialogComponent {
  form: FormGroup;
  readonly isEditMode: boolean;
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData
  ) {
    this.isEditMode = !!data.product;
    this.form = this.fb.group({
      name: [data.product?.name ?? '', [Validators.required, Validators.maxLength(200)]],
      price: [data.product?.price ?? null, [Validators.required, Validators.min(0)]],
      categoryId: [data.product?.category_id ?? null, [Validators.required]]
    });

    if (data.product?.image_path) {
      this.imagePreviewUrl.set(this.resolveImageUrl(data.product.image_path));
    }
  }

  get name() {
    return this.form.get('name')!;
  }
  get price() {
    return this.form.get('price')!;
  }
  get categoryId() {
    return this.form.get('categoryId')!;
  }

  resolveImageUrl(path: string): string {
    const origin = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${origin}${path}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Please select a valid image file');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      this.imageError.set(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    this.imageError.set(null);
    this.selectedImage.set(file);

    const reader = new FileReader();
    reader.onload = () => this.imagePreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: ProductDialogResult = {
      value: {
        name: this.form.value.name.trim(),
        price: Number(this.form.value.price),
        categoryId: Number(this.form.value.categoryId)
      },
      image: this.selectedImage()
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface QuickLink {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly quickLinks: QuickLink[] = [
    {
      title: 'Categories',
      description: 'Manage product categories',
      icon: 'category',
      route: '/categories',
      color: '#2c5f8a'
    },
    {
      title: 'Products',
      description: 'Manage product catalog',
      icon: 'inventory_2',
      route: '/products',
      color: '#0f766e'
    },
    {
      title: 'Bulk Upload',
      description: 'Import products via CSV/Excel',
      icon: 'upload_file',
      route: '/bulk-upload',
      color: '#b45309'
    },
    {
      title: 'Reports',
      description: 'Download CSV/XLSX reports',
      icon: 'summarize',
      route: '/reports',
      color: '#7c3aed'
    }
  ];
}

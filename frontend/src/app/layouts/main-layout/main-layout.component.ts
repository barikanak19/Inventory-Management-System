import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Categories', icon: 'category', route: '/categories' },
    { label: 'Products', icon: 'inventory_2', route: '/products' },
    { label: 'Bulk Upload', icon: 'upload_file', route: '/bulk-upload' },
    { label: 'Reports', icon: 'summarize', route: '/reports' }
  ];

  constructor(
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  isMobile = false;
  isSidenavOpen = true;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 1023px)')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ matches }) => {
        this.isMobile = matches;
        this.isSidenavOpen = !matches;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  onNavSelect(): void {
    if (this.isMobile) {
      this.isSidenavOpen = false;
    }
  }

  get currentUserEmail(): string {
    return this.authService.currentUser()?.email ?? '';
  }

  logout(): void {
    this.authService.logout();
    this.notification.info('You have been logged out');
    this.router.navigate(['/login']);
  }
}

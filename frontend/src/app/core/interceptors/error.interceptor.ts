import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Central place to react to HTTP failures:
 * - 401 -> clear session and redirect to login
 * - Everything else -> show a snackbar with the server's message
 * The error is still re-thrown so individual components can
 * add page-specific handling (e.g. inline form errors) if needed.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        notification.error('Your session has expired. Please log in again.');
        router.navigate(['/login']);
      } else if (error.status === 0) {
        notification.error('Unable to reach the server. Please check your connection.');
      } else {
        const message = error.error?.message || 'Something went wrong. Please try again.';
        notification.error(message);
      }
      return throwError(() => error);
    })
  );
};

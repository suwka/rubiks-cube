import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!localStorage.getItem('token')) {
    return of(router.createUrlTree(['/login']));
  }

  if (authService.currentUser$.value) {
    return of(true);
  }

  return authService.restoreSession().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!localStorage.getItem('token')) {
    return of(router.createUrlTree(['/main']));
  }

  const currentUser = authService.currentUser$.value;
  if (currentUser) {
    return of(currentUser.role === 'admin' ? true : router.createUrlTree(['/main']));
  }

  return authService.restoreSession().pipe(
    map((user) => (user.role === 'admin' ? true : router.createUrlTree(['/main']))),
    catchError(() => of(router.createUrlTree(['/main'])))
  );
};

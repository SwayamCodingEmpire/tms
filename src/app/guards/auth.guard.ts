import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { session } from '../utils/session';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {

    const router = inject(Router);
    const protectedRoutes = ['p'];

    const isLoggedIn = session;
    return protectedRoutes.includes(state.url || '') && !isLoggedIn ? router.navigate(['/login']) : true;
  return true;
};

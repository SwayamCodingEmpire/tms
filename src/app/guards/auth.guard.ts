import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {

    const router = inject(Router);

    // Check the login status from localStorage
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    // If the user is not logged in and tries to access protected routes, redirect to login
    if (!isLoggedIn) {
      router.navigate(['/login']); // Redirect to login if not logged in
      return false; // Block access to the route
    }

    return true; // Allow access to the route if logged in
};

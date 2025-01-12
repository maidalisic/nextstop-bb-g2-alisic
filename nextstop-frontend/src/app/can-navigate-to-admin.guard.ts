import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './shared/authentication.service';

export const canNavigateToAdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthenticationService)
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    auth.login();
    return false;
  } else {
    return true;
  }
};

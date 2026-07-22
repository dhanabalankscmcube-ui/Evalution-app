import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import type { RoleCode } from "../models";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(["/auth/login"]);
};

export function roleGuard(roles: RoleCode[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    return roles.some((r) => auth.hasRole(r));
  };
}

export function permissionGuard(perms: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    return perms.some((p: string) => auth.hasPermission(p));
  };
}

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.createUrlTree(["/app/dashboard"]);
  return true;
};

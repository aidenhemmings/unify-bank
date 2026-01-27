import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UbAdminAuthService } from '@common/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbAdminGuestGuard implements CanActivate {
  private router = inject(Router);
  private adminAuthService = inject(UbAdminAuthService);

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const admin = this.adminAuthService.getCurrentAdmin();
    const token = this.adminAuthService.getToken();

    if (admin || token) {
      return this.router.createUrlTree(['/admin/dashboard']);
    }

    return true;
  }
}

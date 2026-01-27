import { inject, Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router, UrlTree } from '@angular/router';
import { UbAdminAuthService, UbLoadingService } from '@common/services';
import { Observable } from 'rxjs';
import { LoadingKeys } from '@common/enums';

@Injectable({ providedIn: 'root' })
export class UbAdminAuthGuard implements CanActivate, CanMatch {
  private router = inject(Router);
  private adminAuthService = inject(UbAdminAuthService);
  private loadingService = inject(UbLoadingService);

  private async checkAuth(): Promise<boolean | UrlTree> {
    const admin = this.adminAuthService.getCurrentAdmin();

    if (admin) {
      return true;
    }

    const token = this.adminAuthService.getToken();

    if (token) {
      this.loadingService.show(LoadingKeys.GLOBAL, true);

      const isValid = await this.adminAuthService.validateToken();

      this.loadingService.hide(LoadingKeys.GLOBAL);

      if (isValid) {
        return true;
      }
    }

    return this.router.createUrlTree(['/admin/login']);
  }

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.checkAuth();
  }

  canMatch():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.checkAuth();
  }
}

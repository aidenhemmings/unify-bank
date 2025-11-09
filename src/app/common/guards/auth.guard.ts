import { inject, Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router, UrlTree } from '@angular/router';
import {
  UbSupabaseService,
  UbUserService,
  UbLoadingService,
} from '@common/services';
import { Observable } from 'rxjs';
import { LoadingKeys } from '@common/enums';

@Injectable({ providedIn: 'root' })
export class UbAuthGuard implements CanActivate, CanMatch {
  private router = inject(Router);
  private userService = inject(UbUserService);
  private supabaseService = inject(UbSupabaseService);
  private loadingService = inject(UbLoadingService);

  private async checkAuth(): Promise<boolean | UrlTree> {
    const user = this.userService.getCurrentUser();

    if (user) {
      return true;
    }

    const token = this.userService.getToken();

    if (token) {
      this.loadingService.show(LoadingKeys.GLOBAL, true);

      await this.supabaseService.setToken(token);

      const { user: validatedUser, error } =
        await this.supabaseService.validateToken(token);

      if (validatedUser && !error) {
        await this.userService.setCurrentUser(validatedUser);
        this.loadingService.hide(LoadingKeys.GLOBAL);
        return true;
      }

      await this.userService.clearSession();
      this.loadingService.hide(LoadingKeys.GLOBAL);
    }

    return this.router.createUrlTree(['/auth/login']);
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

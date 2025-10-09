import { inject, Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router, UrlTree } from '@angular/router';
import { UbSupabaseService, UbUserService } from '@common/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbAuthGuard implements CanActivate, CanMatch {
  private router = inject(Router);
  private userService = inject(UbUserService);
  private supabaseService = inject(UbSupabaseService);

  private async checkAuth(): Promise<boolean | UrlTree> {
    const user = this.userService.getCurrentUser();

    if (user) {
      return true;
    }

    const token = this.userService.getToken();

    if (token) {
      const { userId } = await this.supabaseService.validateToken(token);

      if (userId) {
        const { user: loadedUser } = await this.supabaseService.getUserById(
          userId
        );

        if (loadedUser) {
          this.userService.setCurrentUser(loadedUser);
          return true;
        }
      }
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

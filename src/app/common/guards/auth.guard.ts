import { inject, Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router, UrlTree } from '@angular/router';
import { UbSupabaseService, UbUserService } from '@common/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbAuthGuard implements CanActivate, CanMatch {
  private router = inject(Router);
  private supabaseService = inject(UbSupabaseService);
  private userService = inject(UbUserService);

  private async checkAuth(): Promise<boolean | UrlTree> {
    const { session } = await this.supabaseService.getSession();

    if (session?.user) {
      this.userService.setCurrentUser(session.user);
      return true;
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

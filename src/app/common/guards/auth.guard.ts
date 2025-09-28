import { inject, Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router, UrlTree } from '@angular/router';
import { UbUserService } from '@common/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbAuthGuard implements CanActivate, CanMatch {
  private router = inject(Router);
  private userService = inject(UbUserService);

  private checkAuth(): boolean | UrlTree {
    const user = this.userService.getCurrentUser();
    if (user) {
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

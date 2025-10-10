import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UbUserService } from '@common/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbGuestGuard implements CanActivate {
  private router = inject(Router);
  private userService = inject(UbUserService);

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const user = this.userService.getCurrentUser();
    const token = this.userService.getToken();

    if (user || token) {
      return this.router.createUrlTree(['/dashboard']);
    }

    return true;
  }
}

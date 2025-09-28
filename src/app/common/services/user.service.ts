import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbUserService {
  private user: Observable<any> | null = null;

  getCurrentUser(): Observable<any> | null {
    return this.user;
  }

  setCurrentUser(user: any): void {
    this.user = user;
  }
}

import { Injectable } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbUserService {
  private userSubject = new BehaviorSubject<User | null>(null);

  get currentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  setCurrentUser(user: User): void {
    this.userSubject.next(user);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }
}

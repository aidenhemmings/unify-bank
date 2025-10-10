import { Injectable } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbUserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private readonly TOKEN_KEY = 'user_token';

  get currentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  setCurrentUser(user: User | null): void {
    this.userSubject.next(user);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearSession(): void {
    this.userSubject.next(null);
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

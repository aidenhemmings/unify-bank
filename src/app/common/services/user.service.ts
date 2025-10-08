import { Injectable } from '@angular/core';
import { User } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { User as SupabaseUser } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class UbUserService {
  private userSubject = new BehaviorSubject<SupabaseUser | null>(null);
  private profileSubject = new BehaviorSubject<User | null>(null);

  get currentUser(): Observable<SupabaseUser | null> {
    return this.userSubject.asObservable();
  }

  get currentProfile(): Observable<User | null> {
    return this.profileSubject.asObservable();
  }

  getCurrentUser(): SupabaseUser | null {
    return this.userSubject.value;
  }

  getCurrentProfile(): User | null {
    return this.profileSubject.value;
  }

  setCurrentUser(user: SupabaseUser | null): void {
    this.userSubject.next(user);
  }

  setCurrentProfile(profile: User | null): void {
    this.profileSubject.next(profile);
  }

  clearUser(): void {
    this.userSubject.next(null);
    this.profileSubject.next(null);
  }
}

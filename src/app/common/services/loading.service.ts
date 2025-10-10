import { Injectable } from '@angular/core';
import { Loader } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbLoadingService {
  private loaders = new Map<string, BehaviorSubject<Loader>>();

  private getOrCreateLoaderSubject(key: string): BehaviorSubject<Loader> {
    if (!this.loaders.has(key)) {
      this.loaders.set(key, new BehaviorSubject<Loader>({ show: false }));
    }
    return this.loaders.get(key)!;
  }

  getLoaderState(key: string): Observable<Loader> {
    return this.getOrCreateLoaderSubject(key).asObservable();
  }

  getLoaderStateValue(key: string): Loader {
    return this.getOrCreateLoaderSubject(key).value;
  }

  show(key: string, fullscreen = false): void {
    this.getOrCreateLoaderSubject(key).next({ show: true, fullscreen });
  }

  hide(key: string): void {
    this.getOrCreateLoaderSubject(key).next({ show: false });
  }
}

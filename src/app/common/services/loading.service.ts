import { Injectable } from '@angular/core';
import { Loader } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbLoadingService {
  private loaders = new Map<string, BehaviorSubject<Loader>>();

  /**
   * Retrieves or creates a loader subject for the given key.
   * @param key - The key for the loader.
   * @returns The loader subject.
   */
  private getOrCreateLoaderSubject(key: string): BehaviorSubject<Loader> {
    if (!this.loaders.has(key)) {
      this.loaders.set(key, new BehaviorSubject<Loader>({ show: false }));
    }
    return this.loaders.get(key)!;
  }

  /**
   * Retrieves the loader state for a given key.
   * @param key - The key for the loader.
   * @returns The loader state observable.
   */
  getLoaderState(key: string): Observable<Loader> {
    return this.getOrCreateLoaderSubject(key).asObservable();
  }

  /**
   * Retrieves the current loader state value for a given key.
   * @param key - The key for the loader.
   * @returns The current loader state value.
   */
  getLoaderStateValue(key: string): Loader {
    return this.getOrCreateLoaderSubject(key).value;
  }

  /**
   * Shows the loader for a given key.
   * @param key - The key for the loader.
   * @param fullscreen - Whether the loader should be fullscreen.
   */
  show(key: string, fullscreen = false): void {
    this.getOrCreateLoaderSubject(key).next({ show: true, fullscreen });
  }

  /**
   * Hides the loader for a given key.
   * @param key - The key for the loader.
   */
  hide(key: string): void {
    this.getOrCreateLoaderSubject(key).next({ show: false });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbSidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  /**
   * Retrieves the current collapsed state of the sidebar.
   */
  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  /**
   * Toggles the collapsed state of the sidebar.
   */
  toggle() {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  /**
   * Collapses the sidebar.
   */
  collapse() {
    this.isCollapsedSubject.next(true);
  }

  /**
   * Expands the sidebar.
   */
  expand() {
    this.isCollapsedSubject.next(false);
  }
}

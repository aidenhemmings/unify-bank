import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UbSidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  toggle() {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  collapse() {
    this.isCollapsedSubject.next(true);
  }

  expand() {
    this.isCollapsedSubject.next(false);
  }
}

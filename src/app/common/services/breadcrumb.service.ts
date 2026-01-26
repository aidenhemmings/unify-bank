import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { Breadcrumb } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class UbBreadcrumbService {
  private router = inject(Router);

  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor() {
    this.updateBreadcrumbs();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  /**
   * Private function to update the breadcrumbs based on the current route.
   */
  private updateBreadcrumbs(): void {
    const breadcrumbs = this.createBreadcrumbs(
      this.router.routerState.snapshot.root
    );
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  /**
   * Private recursive function to create breadcrumbs from the activated route snapshot.
   * @param route - The activated route snapshot.
   * @param url - The base URL for the breadcrumb.
   * @param breadcrumbs - The accumulated breadcrumbs.
   * @returns The updated breadcrumbs array.
   */
  private createBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRouteSnapshot[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  /**
   * Retrieves the current breadcrumbs.
   * @returns The current breadcrumbs.
   */
  getBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbsSubject.value;
  }
}

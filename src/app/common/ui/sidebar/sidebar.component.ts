import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  UbMenuService,
  UbSidebarService,
  UbAdminAuthService,
} from '@common/services';
import { MenuItem, AdminUser } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Sidebar component that provides navigation links and collapsible behavior.
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ub-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class UbSidebarComponent implements OnInit {
  private menuService = inject(UbMenuService);
  private sidebarService = inject(UbSidebarService);
  private adminAuthService = inject(UbAdminAuthService);
  private router = inject(Router);

  @Input() mode: 'user' | 'admin' = 'user';
  @Input() routePrefix: string = '';

  isCollapsed = false;
  menuItems: MenuItem[] = [];
  expandedItems = new Set<string>();
  isMobile = false;
  admin: AdminUser | null = null;

  get isAdminMode(): boolean {
    return this.mode === 'admin';
  }

  ngOnInit() {
    if (this.isAdminMode) {
      this.menuItems = this.menuService.getAdminMenuItems();
      this.admin = this.adminAuthService.getCurrentAdmin();

      this.adminAuthService.currentAdmin
        .pipe(untilDestroyed(this))
        .subscribe((admin) => {
          this.admin = admin;
        });
    } else {
      this.menuItems = this.menuService.getMenuItems();
    }

    this.sidebarService.isCollapsed$
      .pipe(untilDestroyed(this))
      .subscribe((collapsed) => {
        this.isCollapsed = collapsed;
        this.updateBodyClass();
      });

    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  updateBodyClass() {
    if (this.isMobile && this.isCollapsed) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  closeSidebarOnMobile() {
    if (this.isMobile && this.isCollapsed) {
      this.sidebarService.toggle();
    }
  }

  toggleMenuItem(itemId: string) {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  getRouterLink(item: MenuItem): string[] {
    if (this.routePrefix) {
      return ['/' + this.routePrefix, item.routerLink];
    }
    if (item.prefix) {
      return item.suffix
        ? [item.prefix, item.routerLink, item.suffix]
        : [item.prefix, item.routerLink];
    }
    return item.suffix
      ? ['/', item.routerLink, item.suffix]
      : ['/', item.routerLink];
  }

  async logout(): Promise<void> {
    if (this.isAdminMode) {
      await this.adminAuthService.logout();
      await this.router.navigate(['/admin/login']);
    }
  }
}

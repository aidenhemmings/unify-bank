import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UbMenuService, UbSidebarService } from '@common/services';
import { MenuItem } from '@common/types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TooltipModule } from 'primeng/tooltip';

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

  isCollapsed = false;
  menuItems: MenuItem[] = [];
  expandedItems = new Set<string>();
  isMobile = false;

  ngOnInit() {
    this.menuItems = this.menuService.getMenuItems();

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
}

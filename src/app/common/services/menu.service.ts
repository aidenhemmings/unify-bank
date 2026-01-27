import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '@common/types';
import { Permission } from '@common/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UbMenuService {
  /**
   * Declares the menu items subject with initial menu items.
   */
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([
    {
      id: uuidv4(),
      label: 'Dashboard',
      permission: Permission.DASHBOARD_VIEW,
      icon: 'fa-home',
      routerLink: 'dashboard',
      prefix: null,
      visible: true,
    },
    {
      id: uuidv4(),
      label: 'Payments',
      permission: Permission.PAYMENTS_VIEW,
      icon: 'fa-credit-card',
      routerLink: 'payments',
      prefix: null,
      visible: true,
    },
    {
      id: uuidv4(),
      label: 'Accounts',
      permission: Permission.ACCOUNTS_VIEW,
      icon: 'fa-bank',
      routerLink: 'accounts',
      prefix: null,
      visible: true,
    },
    {
      id: uuidv4(),
      label: 'Transactions',
      permission: Permission.TRANSACTIONS_VIEW,
      icon: 'fa-exchange-alt',
      routerLink: 'transactions',
      prefix: null,
      visible: true,
    },
  ]);

  /**
   * Declares the admin menu items subject with initial admin menu items.
   */
  private adminMenuItemsSubject = new BehaviorSubject<MenuItem[]>([
    {
      id: uuidv4(),
      label: 'Dashboard',
      permission: Permission.ADMIN_DASHBOARD_VIEW,
      icon: 'fa-tachometer-alt',
      routerLink: 'dashboard',
      prefix: null,
      visible: true,
    },
    {
      id: uuidv4(),
      label: 'Users',
      permission: Permission.ADMIN_USERS_VIEW,
      icon: 'fa-users',
      routerLink: 'users',
      prefix: null,
      visible: true,
    },
    {
      id: uuidv4(),
      label: 'Invitations',
      permission: Permission.ADMIN_INVITATIONS_VIEW,
      icon: 'fa-envelope',
      routerLink: 'invitations',
      prefix: null,
      visible: true,
    },
  ]);

  menuItems$ = this.menuItemsSubject.asObservable();
  adminMenuItems$ = this.adminMenuItemsSubject.asObservable();

  /**
   * Retrieves the current menu items.
   * @returns The current menu items.
   */
  getMenuItems() {
    return this.menuItemsSubject.value;
  }

  /**
   * Retrieves the current admin menu items.
   * @returns The current admin menu items.
   */
  getAdminMenuItems() {
    return this.adminMenuItemsSubject.value;
  }

  /**
   * Updates the menu items.
   * @param items - The items to set as the current menu items.
   */
  updateMenuItems(items: MenuItem[]) {
    this.menuItemsSubject.next(items);
  }

  /**
   * Updates the admin menu items.
   * @param items - The items to set as the current admin menu items.
   */
  updateAdminMenuItems(items: MenuItem[]) {
    this.adminMenuItemsSubject.next(items);
  }

  /**
   * Filters the menu items based on user permissions.
   * @param userPermissions - The permissions of the current user.
   * @returns The filtered menu items.
   */
  filterMenuByPermissions(userPermissions: Permission[]): MenuItem[] {
    return this.menuItemsSubject.value.filter((item) => {
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    });
  }

  /**
   * Filters the admin menu items based on admin permissions.
   * @param adminPermissions - The permissions of the current admin.
   * @returns The filtered admin menu items.
   */
  filterAdminMenuByPermissions(adminPermissions: Permission[]): MenuItem[] {
    return this.adminMenuItemsSubject.value.filter((item) => {
      if (!item.permission) return true;
      return adminPermissions.includes(item.permission);
    });
  }
}

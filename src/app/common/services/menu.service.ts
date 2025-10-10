import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '@common/types';
import { Permission } from '@common/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UbMenuService {
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

  menuItems$ = this.menuItemsSubject.asObservable();

  getMenuItems() {
    return this.menuItemsSubject.value;
  }

  updateMenuItems(items: MenuItem[]) {
    this.menuItemsSubject.next(items);
  }

  filterMenuByPermissions(userPermissions: Permission[]): MenuItem[] {
    return this.menuItemsSubject.value.filter((item) => {
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    });
  }
}

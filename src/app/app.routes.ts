import { Routes } from '@angular/router';
import {
  UbAccountsComponent,
  UbAuthComponent,
  UbDashboardComponent,
  UbPaymentsComponent,
  UbTransactionsComponent,
  UbUserProfileDashboardComponent,
} from './modules';
import { UbAuthGuard, UbGuestGuard } from './common';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: UbAuthComponent,
    canActivate: [UbGuestGuard],
    data: {
      breadcrumb: 'Auth',
    },
  },
  {
    path: 'dashboard',
    component: UbDashboardComponent,
    canActivate: [UbAuthGuard],
    data: {
      breadcrumb: 'Dashboard',
    },
  },
  {
    path: 'payments',
    component: UbPaymentsComponent,
    canActivate: [UbAuthGuard],
    data: {
      breadcrumb: 'Payments',
    },
  },
  {
    path: 'accounts',
    component: UbAccountsComponent,
    canActivate: [UbAuthGuard],
    data: {
      breadcrumb: 'Accounts',
    },
  },
  {
    path: 'transactions',
    component: UbTransactionsComponent,
    canActivate: [UbAuthGuard],
    data: {
      breadcrumb: 'Transactions',
    },
  },
  {
    path: 'user-profile',
    component: UbUserProfileDashboardComponent,
    canActivate: [UbAuthGuard],
    data: {
      breadcrumb: 'User Profile',
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

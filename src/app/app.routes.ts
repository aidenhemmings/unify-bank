import { Routes } from '@angular/router';
import {
  UbAccountsComponent,
  UbAuthComponent,
  UbDashboardComponent,
  UbPaymentsComponent,
  UbTransactionsComponent,
  UbUserProfileDashboardComponent,
} from './modules';
import {
  UbAuthGuard,
  UbGuestGuard,
  UbAdminAuthGuard,
  UbAdminGuestGuard,
} from './common';
import { UbAdminLoginComponent } from './modules/admin/login';
import { UbAdminLayoutComponent } from './modules/admin/layout';
import { UbAdminDashboardComponent } from './modules/admin/dashboard';
import { UbAdminUsersComponent } from './modules/admin/users';
import { UbAdminInvitationsComponent } from './modules/admin/invitations';
import { UbAcceptInviteComponent } from './modules/auth/accept-invite';

export const routes: Routes = [
  // User auth routes
  {
    path: 'auth/login',
    component: UbAuthComponent,
    canActivate: [UbGuestGuard],
    data: {
      breadcrumb: 'Auth',
    },
  },
  {
    path: 'auth/accept-invite',
    component: UbAcceptInviteComponent,
    data: {
      breadcrumb: 'Accept Invitation',
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
    path: 'admin/login',
    component: UbAdminLoginComponent,
    canActivate: [UbAdminGuestGuard],
    data: {
      breadcrumb: 'Admin Login',
    },
  },
  {
    path: 'admin',
    component: UbAdminLayoutComponent,
    canActivate: [UbAdminAuthGuard],
    children: [
      {
        path: 'dashboard',
        component: UbAdminDashboardComponent,
        data: {
          breadcrumb: 'Admin Dashboard',
        },
      },
      {
        path: 'users',
        component: UbAdminUsersComponent,
        data: {
          breadcrumb: 'User Management',
        },
      },
      {
        path: 'invitations',
        component: UbAdminInvitationsComponent,
        data: {
          breadcrumb: 'Invitations',
        },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

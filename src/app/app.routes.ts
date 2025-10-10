import { Routes } from '@angular/router';
import { UbAuthComponent, UbDashboardComponent } from './modules';
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
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

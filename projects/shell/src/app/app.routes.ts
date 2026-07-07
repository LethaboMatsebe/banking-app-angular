import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('../../../auth-mfe/src/app/app').then(m => m.App)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('../../../dashboard-mfe/src/app/app').then(m => m.App)
  }
];

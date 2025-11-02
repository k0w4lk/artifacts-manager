import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then((_) => _.Admin),
    loadChildren: () => import('./features/admin/admin.routes').then((_) => _.adminRoutes),
  },
];

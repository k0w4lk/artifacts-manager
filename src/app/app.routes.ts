import { Routes } from '@angular/router';
import { StatsCounter } from './features/stats-counter/stats-counter';

export const routes: Routes = [
  {
    path: '',
    component: StatsCounter,
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((_) => _.adminRoutes),
  },
];

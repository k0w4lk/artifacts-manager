import { Routes } from '@angular/router';
import { Admin } from './admin';

export const adminRoutes: Routes = [
  {
    path: '',
    component: Admin,
  },
  {
    path: 'characters',
    loadComponent: () => import('./components/characters/characters').then((_) => _.Characters),
  },
];

import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'characters',
    loadComponent: () => import('./components/characters/characters').then((_) => _.Characters),
  },
];

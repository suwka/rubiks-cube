import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'main' },
	{ path: 'main', component: HomeComponent },
	{ path: 'algs', loadComponent: () => import('./pages/algs/algs.component').then((m) => m.AlgsComponent) },
	{ path: 'algs/pll', loadComponent: () => import('./pages/algs-pll/algs-pll.component').then((m) => m.AlgsPllComponent) },
	{ path: 'algs/oll', loadComponent: () => import('./pages/algs-oll/algs-oll.component').then((m) => m.AlgsOllComponent) },
	{ path: 'algs/f2l', loadComponent: () => import('./pages/algs-f2l/algs-f2l.component').then((m) => m.AlgsF2lComponent) },
	{ path: 'login', component: PlaceholderComponent, data: { title: 'login' } },
	{ path: 'register', component: PlaceholderComponent, data: { title: 'register' } },
	{ path: 'user/:id', component: PlaceholderComponent, data: { title: 'profile' } },
	{ path: 'settings', component: PlaceholderComponent, canActivate: [authGuard], data: { title: 'settings' } },
	{ path: 'admin', component: PlaceholderComponent, canActivate: [adminGuard], data: { title: 'admin' } },
	{ path: '**', redirectTo: 'main' }
];

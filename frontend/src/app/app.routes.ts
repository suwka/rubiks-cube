import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlaceholderComponent } from './shared/components/placeholder/placeholder.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'main' },
	{ path: 'main', component: HomeComponent },
	{ path: 'algs', loadComponent: () => import('./pages/algs/algs.component').then((m) => m.AlgsComponent) },
	{ path: 'algs/pll', loadComponent: () => import('./pages/algs-pll/algs-pll.component').then((m) => m.AlgsPllComponent) },
	{ path: 'algs/oll', loadComponent: () => import('./pages/algs-oll/algs-oll.component').then((m) => m.AlgsOllComponent) },
	{ path: 'algs/f2l', loadComponent: () => import('./pages/algs-f2l/algs-f2l.component').then((m) => m.AlgsF2lComponent) },
	{ path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent), data: { title: 'login' } },
	{ path: 'register', loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent), data: { title: 'register' } },
	{ path: 'user/:id', component: ProfileComponent, data: { title: 'profile' } },
	{ path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent), canActivate: [authGuard], data: { title: 'settings' } },
	{ path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent), canActivate: [adminGuard], data: { title: 'admin' } },
	{ path: '**', redirectTo: 'main' }
];

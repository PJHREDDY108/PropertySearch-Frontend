import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { PropertySearch } from './property-search/property-search';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'search', component: PropertySearch, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
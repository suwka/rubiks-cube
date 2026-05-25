import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, NgIf, RouterLink, RouterLinkActive],
  template: `
    <header class="nav-shell">
      <div class="nav container">
        <a class="brand" routerLink="/main">CubeTracker</a>

        <nav class="links">
          <a routerLink="/main" routerLinkActive="active">Timer</a>
          <a routerLink="/algs" routerLinkActive="active">Algorytmy</a>
        </nav>

        <div class="auth" *ngIf="auth.currentUser$ | async as user; else guestState">
          <button type="button" class="user-button" (click)="menuOpen = !menuOpen">
            {{ user.username }}
            <span class="caret">▾</span>
          </button>

          <div class="menu" *ngIf="menuOpen">
            <a [routerLink]="['/user', user.id]" (click)="menuOpen = false">Mój profil</a>
            <a routerLink="/settings" (click)="menuOpen = false">Ustawienia</a>
            <button type="button" (click)="logout()">Wyloguj</button>
          </div>
        </div>

        <ng-template #guestState>
          <div class="guest">
            <a class="button ghost" routerLink="/login">Zaloguj</a>
            <a class="button" routerLink="/register">Zarejestruj</a>
          </div>
        </ng-template>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; position: sticky; top: 0; z-index: 20; }
    .nav-shell { background: rgba(247, 247, 251, .92); backdrop-filter: blur(16px); border-bottom: 1px solid #e5e7eb; }
    .nav { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .brand { font-weight: 800; letter-spacing: .02em; }
    .links, .guest { display: flex; align-items: center; gap: .9rem; }
    .links a, .button, .user-button, .menu a, .menu button { border: 0; background: transparent; cursor: pointer; }
    .links a.active { text-decoration: underline; text-underline-offset: .2rem; }
    .button { padding: .65rem .95rem; border-radius: .9rem; background: #111827; color: #fff; }
    .button.ghost { background: transparent; color: #111827; border: 1px solid #d1d5db; }
    .auth { position: relative; }
    .user-button { display: inline-flex; align-items: center; gap: .35rem; padding: .55rem .8rem; border: 1px solid #d1d5db; border-radius: .9rem; background: white; }
    .menu { position: absolute; right: 0; top: calc(100% + .5rem); min-width: 180px; background: white; border: 1px solid #e5e7eb; border-radius: 1rem; box-shadow: 0 18px 40px rgba(15, 23, 42, .12); padding: .35rem; display: grid; gap: .25rem; }
    .menu a, .menu button { text-align: left; padding: .7rem .8rem; border-radius: .7rem; }
    .menu a:hover, .menu button:hover { background: #f3f4f6; }
    @media (max-width: 760px) {
      .nav { flex-wrap: wrap; justify-content: center; padding-block: .8rem; }
      .links { order: 3; width: 100%; justify-content: center; }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(protected readonly auth: AuthService) {}

  logout(): void {
    this.menuOpen = false;
    this.auth.logout();
  }
}

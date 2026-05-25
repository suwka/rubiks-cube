import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AdminService, AdminStats } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="admin-shell">
      <div class="admin-main">
        <div class="settings-header">
          <h1 style="margin:0;font-size:20px;font-weight:700">Panel admina</h1>
          <span style="font-size:13px;color:#6b7780">Zarządzanie użytkownikami i statystykami</span>
        </div>

        <div class="stats">
          <div class="settings-card compact">Uzytkownicy: {{ stats?.total_users ?? '...' }}</div>
          <div class="settings-card compact">Ulozenia: {{ stats?.total_solves ?? '...' }}</div>
          <div class="settings-card compact">Algorytmy: {{ stats?.total_algorithms ?? '...' }}</div>
        </div>

        <div class="settings-card admin-controls">
          <div class="admin-meta">
            <span *ngIf="loadingUsers">Ladowanie użytkowników...</span>
            <span *ngIf="!loadingUsers">Strona {{ page }}</span>
          </div>
        </div>

        <div class="settings-card">
          <table class="users-table">
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th><th>Akcje</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of users; trackBy: trackByUserId">
                <td>{{ u.id }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.role }}</td>
                <td>{{ u.created_at }}</td>
                <td class="actions-cell">
                  <button type="button" class="app-action-button admin-action" (click)="goToProfile(u.id)">Profil</button>
                  <button type="button" class="app-action-button admin-action" (click)="promptChangePassword(u.id)">Zmien haslo</button>
                  <button type="button" class="app-action-button admin-action danger" (click)="deleteUser(u.id)">Usun</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination settings-card compact-row">
          <button type="button" class="app-action-button" (click)="prevPage()" [disabled]="page<=1">Poprzednia</button>
          <span>Strona {{ page }}</span>
          <button type="button" class="app-action-button" (click)="nextPage()" [disabled]="!hasMore">Nastepna</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .admin-shell { padding: 36px 0 48px; }
    .admin-main { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; display: grid; gap: 14px; }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .settings-card { padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,.92); box-shadow: 0 8px 30px rgba(10,15,25,0.06); }
    .settings-card.compact { font-weight: 600; color: #111827; }
    .settings-card.compact-row { display:flex; align-items:center; justify-content:space-between; gap: 12px; }
    .admin-controls { display:flex; align-items:center; justify-content:space-between; gap: 12px; }
    .admin-controls input { flex: 1; max-width: 360px; padding: 10px 12px; border-radius: 10px; border: 1px solid #e6eef3; font: inherit; }
    .admin-meta { color:#6b7780; font-size: 13px; }
    .users-table { width: 100%; border-collapse: collapse; }
    .users-table th, .users-table td { padding: 12px 10px; border-bottom: 1px solid #eef3f7; text-align: left; vertical-align: top; }
    .users-table th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #6b7780; }
    .actions-cell { display:flex; gap: 8px; flex-wrap: wrap; }
    .admin-action { width: auto; min-width: 112px; padding: 9px 12px; }
    .admin-action.danger { background: #fee2e2; color: #991b1b; }
    .pagination { justify-content: space-between; }
    @media (max-width: 900px) {
      .stats { grid-template-columns: 1fr; }
      .admin-controls, .settings-card.compact-row { flex-direction: column; align-items: stretch; }
      .users-table { display:block; overflow-x:auto; }
    }
  `]
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  protected stats: AdminStats | null = null;
  protected users: any[] = [];
  protected page = 1;
  protected limit = 20;
  protected hasMore = false;
  protected loadingUsers = false;
  protected loadingStats = false;

  ngOnInit(): void {
    this.loadUsers();
    queueMicrotask(() => this.loadStats());
  }

  loadStats(): void {
    this.loadingStats = true;
    this.adminService.getStats().subscribe({
      next: (s) => (this.stats = s),
      complete: () => (this.loadingStats = false),
      error: () => (this.loadingStats = false)
    });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.adminService.getUsers(this.page, this.limit).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.hasMore = !!res.has_more;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
      }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Usunac uzytkownika?')) return;
    this.adminService.deleteUser(id).subscribe({ next: () => this.loadUsers() });
  }

  goToProfile(id: number): void {
    this.router.navigate(['/user', id]);
  }

  promptChangePassword(id: number): void {
    const p1 = prompt('Nowe haslo:');
    if (!p1) return;
    const p2 = prompt('Powtorz nowe haslo:');
    if (p1 !== p2) {
      alert('Hasla sie nie zgadzaja');
      return;
    }
    this.adminService.changeUserPassword(id, p1, p2).subscribe({ next: () => { alert('Haslo zmienione'); }, error: (e) => { alert(e?.message ?? 'Blad'); } });
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.hasMore) {
      this.page++;
      this.loadUsers();
    }
  }

  trackByUserId(_: number, user: { id: number }): number {
    return user.id;
  }
}

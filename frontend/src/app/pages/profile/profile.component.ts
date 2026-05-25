import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, of, timeout } from 'rxjs';

import { UserService } from '../../core/services/user.service';
import { SolveService } from '../../core/services/solve.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile" style="display:flex;flex-direction:column;align-items:center;padding:32px;max-width:820px;margin:0 auto;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0b1220">
      <div style="text-align:center;margin-bottom:20px;min-height:92px;">
        <h1 style="margin:0;font-size:48px;font-weight:700;letter-spacing:0.4px;"> 
          <ng-container *ngIf="loadingUser">Ladowanie uzytkownika...</ng-container>
          <ng-container *ngIf="!loadingUser">{{ user?.username || 'uzytkownik' }}</ng-container>
        </h1>
        <p *ngIf="user?.bio" style="margin:8px 0 0 0;color:#525f6a;">{{ user.bio }}</p>
        <p *ngIf="user?.cubeSetup" style="margin:6px 0 0 0;color:#7a8993;font-size:13px;">setup: {{ user.cubeSetup }}</p>
        <p class="error" *ngIf="userError" style="color:#b00020;margin-top:8px">{{ userError }}</p>
      </div>

      <div style="width:100%;margin-top:18px">
        <div *ngIf="loadingSolves" style="color:#6b7780">Ladowanie ulozen...</div>
        <p class="error" *ngIf="solvesError" style="color:#b00020">{{ solvesError }}</p>

        <table *ngIf="!loadingSolves && solves?.length" style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 0;border-bottom:1px solid #eee;color:#354145">Time</th>
              <th style="text-align:left;padding:8px 0;border-bottom:1px solid #eee;color:#354145">Scramble</th>
              <th style="text-align:left;padding:8px 0;border-bottom:1px solid #eee;color:#354145">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of solves">
              <td style="padding:10px 0;border-bottom:1px solid #fafafa">{{ (s.timeMs/1000) | number:'1.2-2' }}s</td>
              <td style="padding:10px 0;border-bottom:1px solid #fafafa;color:#222">{{ s.scramble }}</td>
              <td style="padding:10px 0;border-bottom:1px solid #fafafa;color:#6b7780">{{ s.createdAt }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loadingSolves && !solves?.length" style="color:#6b7780">Brak zapisanych ulozen.</div>
      </div>
    </section>
  `
})
export class ProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly solveService = inject(SolveService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected user: any = null;
  protected solves: any[] = [];
  protected loadingUser = false;
  protected loadingSolves = false;
  protected userError = '';
  protected solvesError = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loadingUser = true;
    this.loadingSolves = true;

    this.userService.getUser(id).pipe(
      timeout(5000),
      catchError((err) => {
        console.error('getUser error', err);
        this.userError = err?.message ?? 'Nie mozna pobrac uzytkownika';
        this.loadingUser = false;
        return of(null);
      })
    ).subscribe({ next: (u) => { this.user = u; this.loadingUser = false; this.cdr.detectChanges(); }});

    this.solveService.getUserTop10(id).pipe(
      timeout(5000),
      catchError((err) => {
        console.error('getUserTop10 error', err);
        this.solvesError = err?.message ?? 'Nie mozna pobrac ulozen';
        this.loadingSolves = false;
        return of([]);
      })
    ).subscribe({ next: (s) => { this.solves = s; this.loadingSolves = false; this.cdr.detectChanges(); }});
  }
}

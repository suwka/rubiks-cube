import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section style="display:flex;align-items:center;justify-content:center;padding:36px">
      <div style="width:480px;background:rgba(255,255,255,0.95);padding:28px;border-radius:12px;box-shadow:0 10px 40px rgba(10,15,25,0.06);font-family:inherit">
        <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700">Zarejestruj sie</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:12px">
          <input formControlName="username" placeholder="Username" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
          <input formControlName="email" placeholder="Email" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
          <input type="password" formControlName="password" placeholder="Haslo" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
          <input type="password" formControlName="passwordConfirm" placeholder="Powtorz haslo" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
          <div style="display:flex;justify-content:flex-end">
            <button type="submit" class="app-action-button" [disabled]="form.invalid || loading">Zarejestruj</button>
          </div>
          <p class="error" *ngIf="error" style="color:#b00020;margin:0">{{ error }}</p>
        </form>
      </div>
    </section>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected loading = false;
  protected error = '';

  protected form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirm: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) return;
    const password = String(this.form.value.password ?? '');
    const passwordConfirm = String(this.form.value.passwordConfirm ?? '');
    if (password !== passwordConfirm) {
      this.error = 'Hasla musza byc takie same';
      return;
    }
    this.loading = true;
    this.error = '';
    const username = String(this.form.value.username ?? '');
    const email = String(this.form.value.email ?? '');
    this.authService.register({ username, email, password }).pipe(take(1)).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message ?? 'blad rejestracji';
      }
    });
  }
}

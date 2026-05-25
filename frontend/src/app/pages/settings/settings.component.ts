import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <section class="settings-main">
      <div class="settings-header">
        <h1 style="margin:0;font-size:20px;font-weight:700">Ustawienia konta</h1>
        <a [routerLink]="currentUserId ? ['/user', currentUserId] : ['/main']" style="font-size:13px;color:#6b7780;text-decoration:none">Powrót</a>
      </div>

      <div class="settings-cards">
        <form [formGroup]="profileForm">
          <div class="settings-card">
            <label class="card-title">Bio</label>
            <textarea formControlName="bio" rows="3" [ngStyle]="{ color: profileForm.value.bio === originalProfile.bio ? '#6b7780' : 'inherit' }" style="margin-top:6px;padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fafafa;font:inherit"></textarea>
            <div class="card-actions">
              <button type="button" class="app-action-button" (click)="saveBio()" [disabled]="profileForm.value.bio === originalProfile.bio || savingProfile">Zapisz bio</button>
              <span style="color:#6b7780;font-size:13px">{{ message }}</span>
            </div>
          </div>

          <div class="settings-card">
            <label class="card-title">Cube setup</label>
            <input formControlName="cubeSetup" [ngStyle]="{ color: profileForm.value.cubeSetup === originalProfile.cubeSetup ? '#6b7780' : 'inherit' }" style="margin-top:6px;padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
            <div class="card-actions">
              <button type="button" class="app-action-button" (click)="saveCubeSetup()" [disabled]="profileForm.value.cubeSetup === originalProfile.cubeSetup || savingProfile">Zapisz setup</button>
            </div>
          </div>
        </form>

        <div class="settings-card">
          <h2 style="margin:0 0 6px 0;font-size:15px;font-weight:600">Zmień hasło</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" style="display:flex;flex-direction:column;gap:8px">
            <input type="password" formControlName="oldPassword" placeholder="Stare haslo" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
            <input type="password" formControlName="newPassword" placeholder="Nowe haslo" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
            <input type="password" formControlName="newPasswordConfirm" placeholder="Powtorz nowe haslo" style="padding:10px;border-radius:8px;border:1px solid #e6eef3;background:#fff;font:inherit" />
            <div class="card-actions">
              <button type="submit" class="app-action-button" [disabled]="passwordForm.invalid || changingPassword">Zmien haslo</button>
              <span style="color:#b00020">{{ error }}</span>
              <span style="color:#0b7a3a">{{ passwordMessage }}</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class SettingsComponent {
  protected originalProfile: { bio?: string | null; cubeSetup?: string | null } = {};
  protected currentUserId: number | null = null;
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected savingProfile = false;
  protected changingPassword = false;
  protected message = '';
  protected error = '';
  protected passwordMessage = '';

  protected profileForm = this.fb.group({ bio: [''], cubeSetup: [''] });

  protected passwordForm = this.fb.group({ oldPassword: [''], newPassword: [''], newPasswordConfirm: [''] });

  saveProfile(): void {
    // kept for backward compatibility: save both fields if explicitly used
    if (this.profileForm.pristine) return;
    this.savingProfile = true;
    this.error = '';
    const bio = this.profileForm.value.bio;
    const cubeSetup = this.profileForm.value.cubeSetup;
    const payload: any = {};
    if (bio !== this.originalProfile.bio) payload.bio = bio;
    if (cubeSetup !== this.originalProfile.cubeSetup) payload.cubeSetup = cubeSetup;
    if (!Object.keys(payload).length) {
      this.savingProfile = false;
      this.message = 'Brak zmian';
      return;
    }
    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.savingProfile = false;
        this.message = 'Profil zapisany';
        this.originalProfile.bio = payload.bio ?? this.originalProfile.bio;
        this.originalProfile.cubeSetup = payload.cubeSetup ?? this.originalProfile.cubeSetup;
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        this.savingProfile = false;
        this.error = err?.message ?? 'Nie udalo sie zapisac profilu';
      }
    });
  }

  saveBio(): void {
    const bio = this.profileForm.value.bio;
    if (bio === this.originalProfile.bio) {
      this.message = 'Brak zmian w bio';
      return;
    }
    this.savingProfile = true;
    this.userService.updateProfile({ bio }).subscribe({
      next: () => {
        this.savingProfile = false;
        this.message = 'Bio zapisane';
        this.originalProfile.bio = bio;
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        this.savingProfile = false;
        this.error = err?.message ?? 'Nie udalo sie zapisac bio';
      }
    });
  }

  saveCubeSetup(): void {
    const cubeSetup = this.profileForm.value.cubeSetup;
    if (cubeSetup === this.originalProfile.cubeSetup) {
      this.message = 'Brak zmian w setupie';
      return;
    }
    this.savingProfile = true;
    this.userService.updateProfile({ cubeSetup }).subscribe({
      next: () => {
        this.savingProfile = false;
        this.message = 'Setup zapisany';
        this.originalProfile.cubeSetup = cubeSetup;
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        this.savingProfile = false;
        this.error = err?.message ?? 'Nie udalo sie zapisac setupu';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.newPasswordConfirm) {
      this.error = 'Nowe hasla sie nie zgadzaja';
      return;
    }
    this.changingPassword = true;
    this.error = '';
    this.userService.changePassword({ oldPassword: String(this.passwordForm.value.oldPassword ?? ''), newPassword: String(this.passwordForm.value.newPassword ?? ''), newPasswordConfirm: String(this.passwordForm.value.newPasswordConfirm ?? '') }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordMessage = 'Haslo zmienione';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.changingPassword = false;
        this.error = err?.message ?? 'Nie udalo sie zmienic hasla';
      }
    });
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => {
      if (!u) return;
      // prefill form with current user values so empty inputs mean 'no change'
      this.currentUserId = u.id ?? null;
      this.originalProfile = { bio: u.bio ?? null, cubeSetup: u.cubeSetup ?? null };
      this.profileForm.patchValue({ bio: u.bio ?? '', cubeSetup: u.cubeSetup ?? '' });
    });
  }
}

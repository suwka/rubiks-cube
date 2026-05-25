import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';

import { FormatTimePipe } from '../../shared/pipes/format-time.pipe';
import { AuthService } from '../../core/services/auth.service';
import { SolveService } from '../../core/services/solve.service';

type TimerState = 'idle' | 'holding' | 'ready' | 'running' | 'stopped';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormatTimePipe],
  template: `
    <section class="home-shell">
      <div class="ambient ambient-a"></div>
      <div class="ambient ambient-b"></div>

      <div class="container home-grid">
        <div class="scramble-strip">
          <div class="scramble">{{ currentScramble }}</div>
        </div>

        <div class="timer-stack">
          <section class="timer-card" [attr.data-state]="state">
            <div class="timer-display">{{ elapsedMs | formatTime }}</div>
          </section>
        </div>

        <div class="control-stack">
          <section class="actions-card" *ngIf="state === 'stopped'">
            <ng-container *ngIf="currentUser$ | async as currentUser; else guestBanner">
              <div class="action-row">
                <button type="button" class="action primary" (click)="saveSolve()">zapisz</button>
                <button type="button" class="action" (click)="saveSolve(true)">+2</button>
                <button type="button" class="action danger" (click)="saveSolve(false, true)">dnf</button>
              </div>
            </ng-container>

            <ng-template #guestBanner>
              <div class="guest-banner">
                zaloguj się, żeby zapisywać swoje czasy.
              </div>
            </ng-template>
          </section>

          <p class="feedback success" *ngIf="successMessage">{{ successMessage }}</p>
          <p class="feedback error" *ngIf="errorMessage">{{ errorMessage }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .home-shell {
      position: relative;
      min-height: calc(100dvh - 72px);
      overflow: hidden;
      padding: 1rem 0 2rem;
      display: flex;
      align-items: center;
      background: #ffffff;
      color: #111827;
    }
    .ambient { position: absolute; inset: auto; border-radius: 999px; filter: blur(28px); opacity: .12; pointer-events: none; }
    .ambient-a { width: 14rem; height: 14rem; background: rgba(168, 85, 247, .08); top: 1rem; left: -5rem; }
    .ambient-b { width: 12rem; height: 12rem; background: rgba(99, 102, 241, .05); right: -4rem; bottom: 3rem; }
    .home-grid { position: relative; width: min(860px, calc(100% - 1.5rem)); min-height: calc(100dvh - 9rem); text-align: center; }
    .timer-stack {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(700px, 100%);
      display: grid;
      justify-items: center;
      pointer-events: none;
    }
    .control-stack {
      position: absolute;
      left: 50%;
      top: calc(50% + 7rem);
      transform: translateX(-50%);
      width: min(700px, 100%);
      display: grid;
      gap: .65rem;
      justify-items: center;
      pointer-events: auto;
    }
    .scramble-strip {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: min(1100px, calc(100% - 1.5rem));
      display: grid;
      gap: 0;
      justify-items: center;
      padding-top: .55rem;
      color: rgba(17, 24, 39, .72);
    }
    .scramble {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'Rajdhani', Arial, sans-serif;
      font-weight: 700;
      font-size: clamp(1.05rem, 2.1vw, 1.65rem);
      line-height: 1.08;
      word-spacing: .2rem;
      margin: 0;
      letter-spacing: .01em;
    }
    .timer-card, .actions-card { background: transparent; border: 0; box-shadow: none; backdrop-filter: none; }
    .timer-card { padding: 0; display: grid; gap: 0; justify-items: center; text-align: center; }
    .timer-display {
      font-family: 'SFMono-Regular', 'JetBrains Mono', 'IBM Plex Mono', 'Consolas', monospace;
      font-size: clamp(5.6rem, 14vw, 10rem);
      font-weight: 600;
      letter-spacing: 0;
      line-height: .92;
      color: #111827;
      text-shadow: 0 0 24px rgba(168, 85, 247, .05);
      font-variant-numeric: tabular-nums lining-nums;
      font-feature-settings: 'tnum' 1, 'lnum' 1;
      font-kerning: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: 8ch;
      width: 8ch;
      text-align: center;
      white-space: nowrap;
    }
    .timer-card[data-state='ready'] .timer-display { color: #7c3aed; }
    .timer-card[data-state='running'] .timer-display { color: #111827; }
    .timer-card[data-state='stopped'] .timer-display { color: #5b21b6; }
    .actions-card { padding: .15rem 0 0; display: grid; gap: .65rem; min-height: 4.4rem; align-content: center; }
    .action-row { display: flex; flex-wrap: wrap; gap: .75rem; }
    .action, .secondary { border: 1px solid rgba(168, 85, 247, .25); border-radius: .95rem; padding: .85rem 1.05rem; font-weight: 700; text-transform: lowercase; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease, background .15s ease; }
    .action:hover, .secondary:hover { transform: translateY(-1px); }
    .primary { background: #111827; color: #fff; box-shadow: 0 12px 30px rgba(17, 24, 39, .12); }
    .danger { background: rgba(220, 38, 38, .08); color: #b91c1c; }
    .secondary { background: rgba(168, 85, 247, .08); color: #4c1d95; }
    .wide { width: 100%; }
    .guest-banner { padding: .75rem 1rem; border-radius: 1rem; background: rgba(168, 85, 247, .05); color: #4c1d95; border: 1px solid rgba(168, 85, 247, .10); font-weight: 600; }
    .small-note { margin: 0; color: rgba(17, 24, 39, .62); font-size: .92rem; }
    .feedback { margin: 0; min-height: 2.4rem; padding: .65rem 1rem; border-radius: .95rem; font-weight: 600; display: flex; align-items: center; justify-content: center; }
    .success { background: rgba(34, 197, 94, .09); color: #166534; }
    .error { background: rgba(239, 68, 68, .08); color: #991b1b; }
    @media (min-width: 980px) {
      .home-grid { width: min(940px, 100%); }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly solveService = inject(SolveService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly currentUser$ = this.auth.currentUser$;

  state: TimerState = 'idle';
  elapsedMs = 0;
  currentScramble = '';
  successMessage = '';
  errorMessage = '';

  private holdTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private tickIntervalId: ReturnType<typeof setInterval> | null = null;
  private messageTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private runningStartedAt = 0;
  private stoppedTimeMs = 0;

  ngOnInit(): void {
    this.newScramble();
  }

  ngOnDestroy(): void {
    this.clearHoldTimer();
    this.clearTickTimer();
    this.clearMessageTimer();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code !== 'Space' || event.repeat) {
      return;
    }

    event.preventDefault();

    if (this.state === 'idle' || this.state === 'stopped') {
      this.beginHold();
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code !== 'Space') {
      return;
    }

    event.preventDefault();

    if (this.state === 'holding') {
      this.cancelHold();
      return;
    }

    if (this.state === 'ready') {
      this.startRunning();
      return;
    }

    if (this.state === 'running') {
      this.stopRunning();
    }
  }

  saveSolve(applyPlusTwo = false, applyDnf = false): void {
    if (this.state !== 'stopped') {
      return;
    }

    const payloadTime = applyPlusTwo ? this.stoppedTimeMs + 2000 : this.stoppedTimeMs;
    this.solveService.createSolve({
      timeMs: payloadTime,
      scramble: this.currentScramble,
      dnf: applyDnf,
      plusTwo: applyPlusTwo
    }).subscribe({
      next: () => {
        this.successMessage = applyDnf ? 'dnf zapisane.' : applyPlusTwo ? '+2 zapisane.' : 'czas zapisany.';
        this.errorMessage = '';
        this.flashMessage();
        this.newScramble();
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : 'nie mozna zapisac czasu.';
        this.successMessage = '';
        this.flashMessage();
      }
    });
  }

  newScramble(): void {
    this.clearHoldTimer();
    this.clearTickTimer();
    this.state = 'idle';
    this.elapsedMs = 0;
    this.stoppedTimeMs = 0;
    this.currentScramble = this.generateScramble();
    this.cdr.detectChanges();
  }

  get stateText(): string {
    switch (this.state) {
      case 'holding':
        return 'holding';
      case 'ready':
        return 'ready';
      case 'running':
        return 'running';
      case 'stopped':
        return 'stopped';
      default:
        return 'idle';
    }
  }

  get stateHint(): string {
    switch (this.state) {
      case 'holding':
        return 'przytrzymaj spacje przez 0.5 s.';
      case 'ready':
        return 'zwolnij spacje, aby wystartować.';
      case 'running':
        return 'zatrzymaj spacje, gdy skończysz układać.';
      case 'stopped':
        return 'możesz zapisać wynik.';
      default:
        return 'naciśnij i przytrzymaj spacje, aby uzbroić timer.';
    }
  }

  private beginHold(): void {
    this.clearHoldTimer();
    this.state = 'holding';
    this.cdr.detectChanges();
    this.holdTimeoutId = setTimeout(() => {
      if (this.state === 'holding') {
        this.state = 'ready';
        this.cdr.detectChanges();
      }
    }, 500);
  }

  private cancelHold(): void {
    this.clearHoldTimer();
    this.state = 'idle';
    this.cdr.detectChanges();
  }

  private startRunning(): void {
    this.clearHoldTimer();
    this.clearTickTimer();
    this.elapsedMs = 0;
    this.runningStartedAt = performance.now();
    this.state = 'running';
    this.cdr.detectChanges();
    this.tickIntervalId = setInterval(() => {
      this.elapsedMs = Math.floor(performance.now() - this.runningStartedAt);
      this.cdr.detectChanges();
    }, 10);
  }

  private stopRunning(): void {
    this.clearTickTimer();
    this.elapsedMs = Math.floor(performance.now() - this.runningStartedAt);
    this.stoppedTimeMs = this.elapsedMs;
    this.state = 'stopped';
    this.cdr.detectChanges();
  }

  private generateScramble(): string {
    const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
    const suffixes = ['', '2', "'"];
    const moves: string[] = [];
    let previousFace = '';

    while (moves.length < 25) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      if (face === previousFace) {
        continue;
      }

      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      moves.push(`${face}${suffix}`);
      previousFace = face;
    }

    return moves.join(' ');
  }

  private flashMessage(): void {
    this.clearMessageTimer();
    this.messageTimeoutId = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  private clearHoldTimer(): void {
    if (this.holdTimeoutId) {
      clearTimeout(this.holdTimeoutId);
      this.holdTimeoutId = null;
    }
  }

  private clearTickTimer(): void {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  private clearMessageTimer(): void {
    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
      this.messageTimeoutId = null;
    }
  }
}

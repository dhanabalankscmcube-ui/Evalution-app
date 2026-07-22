import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AuthService, DEMO_ACCOUNTS } from "../../core/auth/auth.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth">
      <!-- Animated mesh gradient background -->
      <div class="auth__bg">
        <div class="auth__blob auth__blob--1"></div>
        <div class="auth__blob auth__blob--2"></div>
        <div class="auth__blob auth__blob--3"></div>
        <div class="auth__grid"></div>
      </div>

      <!-- Top brand bar -->
      <header class="auth__topbar">
        <div class="auth__brand">
          <div class="auth__brand-mark">
            <mat-icon>workspace_premium</mat-icon>
          </div>
          <span class="auth__brand-name">HR Performance</span>
        </div>
        <div class="auth__topbar-meta">
          <span class="auth__dot"></span>
          <span>Demo Environment</span>
        </div>
      </header>

      <!-- Main content -->
      <main class="auth__main">
        <!-- Glass login card -->
        <section class="auth__card" [class.auth__card--shake]="shake()">
          <div class="auth__card-head">
            <h1 class="auth__card-title">Welcome back</h1>
            <p class="auth__card-sub">Sign in to access your performance workspace</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth__form">
            <!-- Email -->
            <div class="field" [class.field--focus]="focusedField() === 'email'" [class.field--error]="isInvalid('email')">
              <label for="email">Email</label>
              <div class="field__control">
                <mat-icon class="field__icon">mail_outline</mat-icon>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                  (focus)="focusedField.set('email')"
                  (blur)="focusedField.set('')"
                />
              </div>
              @if (isInvalid('email')) {
                <span class="field__msg">{{ loginForm.get('email')?.hasError('required') ? 'Email is required' : 'Enter a valid email' }}</span>
              }
            </div>

            <!-- Password -->
            <div class="field" [class.field--focus]="focusedField() === 'password'" [class.field--error]="isInvalid('password')">
              <label for="password">Password</label>
              <div class="field__control">
                <mat-icon class="field__icon">lock_outline</mat-icon>
                <input
                  id="password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  (focus)="focusedField.set('password')"
                  (blur)="focusedField.set('')"
                />
                <button type="button" class="field__toggle" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (isInvalid('password')) {
                <span class="field__msg">Password is required</span>
              }
            </div>

            <div class="auth__row">
              <label class="auth__check">
                <input type="checkbox" />
                <span class="auth__check-box"></span>
                Remember me
              </label>
              <button type="button" class="auth__link" (click)="toast.info('Password reset is not available in demo mode.')">Forgot password?</button>
            </div>

            <button type="submit" class="auth__submit" [disabled]="loading()">
              @if (loading()) {
                <mat-progress-spinner diameter="18" mode="indeterminate" />
              } @else {
                Sign in
                <mat-icon>arrow_forward</mat-icon>
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="auth__divider">
            <span>Quick demo access</span>
          </div>

          <!-- Demo role cards -->
          <div class="roles">
            @for (acc of demoAccounts; track acc.userId; let i = $index) {
              <button
                class="role-card"
                [style.animation-delay]="i * 80 + 'ms'"
                (click)="quickLogin(acc)"
                [disabled]="loading()"
              >
                <div class="role-card__avatar" [style.background]="acc.gradient">
                  <mat-icon>{{ acc.icon }}</mat-icon>
                </div>
                <div class="role-card__body">
                  <div class="role-card__top">
                    <span class="role-card__name">{{ acc.firstName }} {{ acc.lastName }}</span>
                    <span class="role-card__pill" [style.--pill]="acc.color">{{ acc.roleLabel }}</span>
                  </div>
                  <span class="role-card__desc">{{ acc.description }}</span>
                </div>
                <mat-icon class="role-card__arrow">arrow_forward</mat-icon>
              </button>
            }
          </div>

          <div class="auth__hint">
            <mat-icon>key</mat-icon>
            <span>Password for all accounts: <strong>password123</strong></span>
          </div>
        </section>

        <!-- Side info panel (desktop only) -->
        <aside class="auth__info">
          <div class="auth__info-item">
            <mat-icon>rate_review</mat-icon>
            <div>
              <h3>360° Reviews</h3>
              <p>Self-evaluation, manager review, and approval in one flow</p>
            </div>
          </div>
          <div class="auth__info-item">
            <mat-icon>insights</mat-icon>
            <div>
              <h3>Live Insights</h3>
              <p>Track goals, ratings, and performance trends over time</p>
            </div>
          </div>
          <div class="auth__info-item">
            <mat-icon>shield</mat-icon>
            <div>
              <h3>Role-Based Access</h3>
              <p>Tailored dashboards for employees, managers, and HR admins</p>
            </div>
          </div>
        </aside>
      </main>

      <footer class="auth__footer">
        <span>&copy; 2026 HR Performance System</span>
        <span class="auth__footer-sep">·</span>
        <span>Demo build for evaluation</span>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .auth {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      background: #0a0e1a;
      color: #e8eaed;
      font-family: var(--font-family);
    }

    /* ---- Animated mesh background ---- */
    .auth__bg {
      position: fixed; inset: 0; z-index: 0;
      overflow: hidden;
      background: radial-gradient(ellipse at top, #0f1729 0%, #0a0e1a 50%);
    }
    .auth__blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.35;
      animation: blob-float 18s ease-in-out infinite;
    }
    .auth__blob--1 {
      width: 480px; height: 480px;
      background: #2563eb;
      top: -120px; left: -80px;
      animation-delay: 0s;
    }
    .auth__blob--2 {
      width: 520px; height: 520px;
      background: #0d9488;
      bottom: -160px; right: -120px;
      animation-delay: -6s;
    }
    .auth__blob--3 {
      width: 360px; height: 360px;
      background: #1e40af;
      top: 40%; left: 55%;
      animation-delay: -12s;
      opacity: 0.2;
    }
    @keyframes blob-float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33%      { transform: translate(40px, -30px) scale(1.08); }
      66%      { transform: translate(-30px, 40px) scale(0.95); }
    }
    .auth__grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 80% 60% at center, black 0%, transparent 70%);
    }

    /* ---- Top bar ---- */
    .auth__topbar {
      position: relative; z-index: 2;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 40px;
    }
    .auth__brand {
      display: flex; align-items: center; gap: 12px;
    }
    .auth__brand-mark {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #2563eb, #1e40af);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(37,99,235,0.4);
    }
    .auth__brand-mark mat-icon { color: #fff; font-size: 22px !important; width: 22px !important; height: 22px !important; }
    .auth__brand-name { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
    .auth__topbar-meta {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #6b7280; font-weight: 500;
    }
    .auth__dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

    /* ---- Main layout ---- */
    .auth__main {
      position: relative; z-index: 2;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 64px;
      padding: 20px 40px 40px;
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
    }

    /* ---- Glass card ---- */
    .auth__card {
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 36px 32px 28px;
      box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.02) inset;
      animation: card-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes card-in {
      from { opacity: 0; transform: translateY(16px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .auth__card--shake {
      animation: shake 400ms ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }

    .auth__card-head { margin-bottom: 24px; }
    .auth__card-title {
      font-size: 22px; font-weight: 700; margin: 0;
      letter-spacing: -0.02em; color: #f8fafc;
    }
    .auth__card-sub {
      font-size: 13px; color: #94a3b8; margin: 6px 0 0; line-height: 1.5;
    }

    /* ---- Form fields ---- */
    .auth__form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field > label {
      font-size: 12px; font-weight: 600; color: #94a3b8;
      letter-spacing: 0.02em; text-transform: uppercase;
      transition: color 200ms;
    }
    .field--focus > label { color: #60a5fa; }
    .field--error > label { color: #f87171; }

    .field__control {
      display: flex; align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      transition: all 200ms ease;
    }
    .field--focus .field__control {
      border-color: rgba(96, 165, 250, 0.5);
      background: rgba(37, 99, 235, 0.06);
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
    }
    .field--error .field__control {
      border-color: rgba(248, 113, 113, 0.4);
    }
    .field__icon {
      font-size: 20px !important; width: 20px !important; height: 20px !important;
      color: #64748b;
      margin-left: 12px;
      flex-shrink: 0;
      transition: color 200ms;
    }
    .field--focus .field__icon { color: #60a5fa; }
    .field__control input {
      flex: 1;
      background: none; border: none; outline: none;
      padding: 12px 12px 12px 10px;
      font-size: 14px; color: #f1f5f9;
      font-family: var(--font-family);
    }
    .field__control input::placeholder { color: #475569; }
    .field__toggle {
      background: none; border: none; cursor: pointer;
      padding: 0 12px;
      display: flex; align-items: center;
      color: #64748b;
      transition: color 150ms;
    }
    .field__toggle:hover { color: #cbd5e1; }
    .field__toggle mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }
    .field__msg {
      font-size: 12px; color: #f87171; font-weight: 500;
      padding-left: 2px;
    }

    /* ---- Row: remember + forgot ---- */
    .auth__row {
      display: flex; align-items: center; justify-content: space-between;
      margin: 2px 0 4px;
    }
    .auth__check {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #94a3b8; cursor: pointer;
      position: relative;
    }
    .auth__check input {
      position: absolute; opacity: 0; width: 16px; height: 16px; cursor: pointer;
    }
    .auth__check-box {
      width: 16px; height: 16px; border-radius: 4px;
      border: 1.5px solid #475569;
      display: flex; align-items: center; justify-content: center;
      transition: all 150ms;
    }
    .auth__check input:checked + .auth__check-box {
      background: #2563eb;
      border-color: #2563eb;
    }
    .auth__check input:checked + .auth__check-box::after {
      content: "";
      width: 4px; height: 8px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      margin-top: -2px;
    }
    .auth__link {
      font-size: 13px; color: #60a5fa; background: none; border: none;
      cursor: pointer; font-weight: 600; font-family: var(--font-family);
      transition: color 150ms;
    }
    .auth__link:hover { color: #93c5fd; }

    /* ---- Submit button ---- */
    .auth__submit {
      height: 48px;
      border: none; border-radius: 10px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #fff;
      font-size: 15px; font-weight: 700;
      font-family: var(--font-family);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 200ms ease;
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
      position: relative;
      overflow: hidden;
    }
    .auth__submit::before {
      content: "";
      position: absolute; inset: 0;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      opacity: 0;
      transition: opacity 200ms;
    }
    .auth__submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
    }
    .auth__submit:hover:not(:disabled)::before { opacity: 1; }
    .auth__submit:active:not(:disabled) { transform: translateY(0); }
    .auth__submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .auth__submit mat-icon,
    .auth__submit ::ng-deep mat-progress-spinner { position: relative; z-index: 1; }
    .auth__submit mat-icon {
      font-size: 20px !important; width: 20px !important; height: 20px !important;
      transition: transform 200ms;
    }
    .auth__submit:hover:not(:disabled) mat-icon { transform: translateX(3px); }

    /* ---- Divider ---- */
    .auth__divider {
      display: flex; align-items: center; gap: 12px;
      margin: 24px 0 14px;
    }
    .auth__divider::before, .auth__divider::after {
      content: ""; flex: 1; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    }
    .auth__divider span { font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 0.04em; }

    /* ---- Role cards ---- */
    .roles { display: flex; flex-direction: column; gap: 8px; }
    .role-card {
      display: flex; align-items: center; gap: 12px;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer; text-align: left; width: 100%;
      font-family: var(--font-family);
      color: inherit;
      transition: all 200ms ease;
      animation: card-in 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: 200ms;
    }
    .role-card:hover:not(:disabled) {
      border-color: rgba(96, 165, 250, 0.3);
      background: rgba(37, 99, 235, 0.06);
      transform: translateX(2px);
    }
    .role-card:disabled { opacity: 0.5; cursor: not-allowed; }

    .role-card__avatar {
      width: 38px; height: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .role-card__avatar mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; color: #fff; }

    .role-card__body { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .role-card__top { display: flex; align-items: center; gap: 8px; }
    .role-card__name { font-size: 13px; font-weight: 700; color: #f1f5f9; }
    .role-card__pill {
      font-size: 10px; font-weight: 700;
      padding: 2px 8px; border-radius: 20px;
      background: color-mix(in srgb, var(--pill) 15%, transparent);
      color: var(--pill);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .role-card__desc {
      font-size: 11px; color: #64748b;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .role-card__arrow {
      font-size: 18px !important; width: 18px !important; height: 18px !important;
      color: #475569;
      transition: all 200ms ease;
      flex-shrink: 0;
    }
    .role-card:hover:not(:disabled) .role-card__arrow {
      color: #60a5fa;
      transform: translateX(3px);
    }

    /* ---- Hint ---- */
    .auth__hint {
      display: flex; align-items: center; gap: 6px;
      margin-top: 14px;
      padding: 9px 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 11px; color: #64748b;
    }
    .auth__hint mat-icon { font-size: 15px !important; width: 15px !important; height: 15px !important; color: #60a5fa; }
    .auth__hint strong { color: #cbd5e1; }

    /* ---- Side info panel ---- */
    .auth__info {
      display: flex;
      flex-direction: column;
      gap: 28px;
      max-width: 280px;
      animation: card-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: 150ms;
    }
    .auth__info-item {
      display: flex; gap: 14px;
    }
    .auth__info-item mat-icon {
      font-size: 22px !important; width: 22px !important; height: 22px !important;
      color: #60a5fa;
      flex-shrink: 0; margin-top: 2px;
    }
    .auth__info-item h3 {
      font-size: 14px; font-weight: 700; margin: 0; color: #e2e8f0;
    }
    .auth__info-item p {
      font-size: 12px; color: #64748b; margin: 4px 0 0; line-height: 1.5;
    }

    /* ---- Footer ---- */
    .auth__footer {
      position: relative; z-index: 2;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 16px;
      font-size: 12px; color: #475569;
    }
    .auth__footer-sep { opacity: 0.5; }

    /* ---- Responsive ---- */
    @media (max-width: 880px) {
      .auth__info { display: none; }
      .auth__main { gap: 0; }
    }
    @media (max-width: 520px) {
      .auth__topbar { padding: 16px 20px; }
      .auth__topbar-meta { display: none; }
      .auth__main { padding: 12px 16px 24px; }
      .auth__card { padding: 28px 20px 24px; border-radius: 16px; }
      .auth__footer { flex-direction: column; gap: 4px; }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  toast = inject(ToastService);

  loading = signal(false);
  hidePassword = signal(true);
  shake = signal(false);
  focusedField = signal("");
  demoAccounts = DEMO_ACCOUNTS.map((a) => ({
    ...a,
    gradient: `linear-gradient(135deg, ${a.color}, ${a.color}dd)`,
  }));

  loginForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  async quickLogin(acc: typeof DEMO_ACCOUNTS[0]): Promise<void> {
    this.loginForm.patchValue({ email: acc.email, password: acc.password });
    await this.onLogin();
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.triggerShake();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    setTimeout(async () => {
      const { error } = await this.auth.signIn(email!, password!);
      this.loading.set(false);

      if (error) {
        this.toast.error(error);
        this.triggerShake();
        return;
      }

      this.toast.success(`Welcome back, ${this.auth.fullName()}!`);
      const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl") || "/app/dashboard";
      this.router.navigateByUrl(returnUrl);
    }, 700);
  }

  private triggerShake(): void {
    this.shake.set(false);
    setTimeout(() => this.shake.set(true), 10);
    setTimeout(() => this.shake.set(false), 500);
  }
}

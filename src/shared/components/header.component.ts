import { Component, Output, EventEmitter, inject, signal, computed, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AuthService } from "../../core/auth/auth.service";
import { ThemeService } from "../services/theme.service";

interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  color: string;
}

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  template: `
    <header class="header">
      <!-- Left: Logo + App Name -->
      <div class="header__left">
        <div class="header__logo">
          <mat-icon>workspace_premium</mat-icon>
        </div>
        <span class="header__app-name">HR Performance</span>
      </div>

      <!-- Center: Global Search -->
      <div class="header__search">
        <mat-icon class="header__search-icon">search</mat-icon>
        <input
          type="text"
          placeholder="Search evaluations, employees, reports..."
          class="header__search-input"
        />
      </div>

      <!-- Right: Actions -->
      <div class="header__actions">
        <!-- Notifications -->
        <button mat-icon-button matTooltip="Notifications" class="header__icon-btn"
          [matMenuTriggerFor]="notifMenu" [matMenuTriggerRestoreFocus]="false">
          <mat-icon>notifications</mat-icon>
          @if (unreadCount() > 0) {
            <span class="header__badge-dot"></span>
          }
        </button>
        <mat-menu #notifMenu="matMenu" class="notif-menu" xPosition="before" yPosition="below">
          <div class="notif-header">
            <span class="notif-header__title">Notifications</span>
            @if (unreadCount() > 0) {
              <span class="notif-header__count">{{ unreadCount() }} new</span>
            }
          </div>
          <div class="notif-list">
            @for (n of notifications(); track n.id) {
              <button mat-menu-item class="notif-item" [class.notif-item--unread]="!n.read" (click)="markRead(n.id)">
                <div class="notif-item__icon notif-item__icon--{{ n.color }}">
                  <mat-icon>{{ n.icon }}</mat-icon>
                </div>
                <div class="notif-item__body">
                  <div class="notif-item__title">{{ n.title }}</div>
                  <div class="notif-item__msg">{{ n.message }}</div>
                  <div class="notif-item__time">{{ n.time }}</div>
                </div>
              </button>
            } @empty {
              <div class="notif-empty">
                <mat-icon>notifications_off</mat-icon>
                <p>No notifications</p>
              </div>
            }
          </div>
          <div class="notif-footer">
            <button mat-stroked-button class="notif-footer__btn" (click)="markAllRead()">Mark all as read</button>
          </div>
        </mat-menu>

        <!-- Dark Mode -->
        <button mat-icon-button matTooltip="Toggle Dark Mode" class="header__icon-btn" (click)="theme.toggle()">
          <mat-icon>{{ theme.darkMode() ? 'dark_mode' : 'light_mode' }}</mat-icon>
        </button>

        <!-- Help -->
        <button mat-icon-button matTooltip="Help" class="header__icon-btn" (click)="goToHelp()">
          <mat-icon>help_outline</mat-icon>
        </button>

        <!-- Settings -->
        <button mat-icon-button matTooltip="Settings" class="header__icon-btn" (click)="goToSettings()">
          <mat-icon>settings</mat-icon>
        </button>

        <div class="header__divider"></div>

        <!-- Profile Dropdown -->
        <button mat-button [matMenuTriggerFor]="profileMenu" class="header__profile-btn">
          <div class="header__avatar">{{ auth.initials() }}</div>
          <div class="header__profile-info">
            <span class="header__profile-name">{{ auth.fullName() }}</span>
            <span class="header__profile-role">{{ roleLabel() }}</span>
          </div>
          <mat-icon class="header__profile-arrow">expand_more</mat-icon>
        </button>

        <mat-menu #profileMenu="matMenu" class="profile-menu" xPosition="before" yPosition="below">
          <div class="profile-menu__header">
            <div class="header__avatar header__avatar--lg">{{ auth.initials() }}</div>
            <div class="profile-menu__user">
              <div class="profile-menu__name">{{ auth.fullName() }}</div>
              <div class="profile-menu__email">{{ auth.user()?.email }}</div>
            </div>
          </div>
          <button mat-menu-item (click)="goToProfile()">
            <mat-icon>person</mat-icon>
            <span>My Profile</span>
          </button>
          <button mat-menu-item (click)="goToSettings()">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <button mat-menu-item (click)="goToHelp()">
            <mat-icon>help</mat-icon>
            <span>Help &amp; Support</span>
          </button>
          <div class="profile-menu__divider"></div>
          <button mat-menu-item (click)="logout()" class="profile-menu__logout">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 30;
      height: 64px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
      transition: background var(--transition), border-color var(--transition);
    }

    .header__left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .header__logo {
      width: 36px; height: 36px; border-radius: 8px;
      background: #2563eb;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .header__logo mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }
    .header__app-name {
      font-weight: 700; font-size: 16px; color: var(--color-text);
      white-space: nowrap; letter-spacing: -0.02em;
    }

    .header__search {
      flex: 1;
      max-width: 480px;
      display: flex; align-items: center; gap: 8px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 0 14px;
      height: 40px;
      transition: border-color 200ms ease, box-shadow 200ms ease;
    }
    .header__search:focus-within {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .header__search-icon { color: var(--color-text-muted); font-size: 20px !important; width: 20px !important; height: 20px !important; }
    .header__search-input {
      border: none; background: transparent; outline: none;
      font-size: 14px; color: var(--color-text); width: 100%;
      font-family: inherit;
    }
    .header__search-input::placeholder { color: var(--color-text-muted); }

    .header__actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .header__icon-btn { position: relative; color: var(--color-text-muted); }
    .header__icon-btn:hover { color: var(--color-text); }
    .header__badge-dot {
      position: absolute;
      top: 8px; right: 8px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #ef4444;
      border: 2px solid var(--color-surface);
    }

    .header__divider { width: 1px; height: 32px; background: var(--color-border); margin: 0 8px; }

    .header__profile-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 4px 8px 4px 4px !important;
      border-radius: 10px;
      height: 44px;
      color: var(--color-text) !important;
    }
    .header__avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #2563eb; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .header__avatar--lg { width: 44px; height: 44px; font-size: 16px; }
    .header__profile-info { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.3; }
    .header__profile-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
    .header__profile-role { font-size: 12px; color: var(--color-text-muted); }
    .header__profile-arrow { color: var(--color-text-muted); }

    @media (max-width: 768px) {
      .header__app-name { display: none; }
      .header__search { display: none; }
      .header__profile-info { display: none; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private router = inject(Router);

  private _notifications = signal<NotificationItem[]>([
    {
      id: "n1", icon: "rate_review", color: "primary",
      title: "Evaluation Submitted",
      message: "Your Q1 2026 self-evaluation was submitted for review.",
      time: "2 hours ago", read: false,
    },
    {
      id: "n2", icon: "check_circle", color: "success",
      title: "Evaluation Approved",
      message: "Sarah Williams approved your Q1 2026 performance review.",
      time: "5 hours ago", read: false,
    },
    {
      id: "n3", icon: "pending_actions", color: "warning",
      title: "Action Required",
      message: "Mike Johnson submitted a review awaiting your approval.",
      time: "1 day ago", read: false,
    },
    {
      id: "n4", icon: "event", color: "info",
      title: "Review Period Starting",
      message: "Q2 2026 Performance Review period starts in 5 days.",
      time: "2 days ago", read: true,
    },
  ]);

  notifications = this._notifications.asReadonly();
  unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);

  roleLabel(): string {
    const roles = this.auth.roles();
    if (!roles.length) return "User";
    const labels: Record<string, string> = {
      employee: "Employee",
      manager: "Manager",
      hr_admin: "HR Administrator",
    };
    return labels[roles[0].code] ?? roles[0].name;
  }

  markRead(id: string): void {
    this._notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  goToProfile(): void { this.router.navigate(["/app/profile"]); }
  goToSettings(): void { this.router.navigate(["/app/settings"]); }
  goToHelp(): void { this.router.navigate(["/app/help"]); }
  logout(): void {
    this.auth.signOut();
    this.router.navigate(["/auth/login"]);
  }
}

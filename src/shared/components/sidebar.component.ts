import { Component, Input, Output, EventEmitter, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from "../../core/auth/auth.service";

export interface NavChild {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

export interface NavGroup {
  label: string;
  icon: string;
  route?: string;
  children?: NavChild[];
  roles?: string[];
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, MatButtonModule],
  template: `
    <aside
      class="sidebar"
      [class.sidebar--collapsed]="collapsed"
    >
      <!-- Logo -->
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon">
          <mat-icon>workspace_premium</mat-icon>
        </div>
        @if (!collapsed) {
          <span class="sidebar__logo-text">HR Performance</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        @for (item of visibleNavItems; track item.label) {
          @if (item.children && item.children.length > 0) {
            <div class="nav-group">
              @if (!collapsed) {
                <div class="nav-group__title">{{ item.label }}</div>
              }
              @for (child of visibleChildren(item); track child.route) {
                <a
                  [routerLink]="child.route"
                  routerLinkActive="nav-link--active"
                  [routerLinkActiveOptions]="{ exact: false }"
                  class="nav-link"
                  [matTooltip]="collapsed ? child.label : ''"
                  matTooltipPosition="right"
                >
                  <mat-icon class="nav-link__icon">{{ child.icon }}</mat-icon>
                  @if (!collapsed) {
                    <span class="nav-link__label">{{ child.label }}</span>
                  }
                </a>
              }
            </div>
          } @else {
            <a
              [routerLink]="item.route"
              routerLinkActive="nav-link--active"
              [routerLinkActiveOptions]="{ exact: false }"
              class="nav-link"
              [matTooltip]="collapsed ? item.label : ''"
              matTooltipPosition="right"
            >
              <mat-icon class="nav-link__icon">{{ item.icon }}</mat-icon>
              @if (!collapsed) {
                <span class="nav-link__label">{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>

      <!-- Collapse toggle -->
      <div class="sidebar__footer">
        <button class="sidebar__toggle" (click)="toggleCollapsed()">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          @if (!collapsed) {
            <span>Collapse</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: contents; }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      z-index: 40;
      transition: width 280ms cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border-right: 1px solid var(--sidebar-border);
    }
    .sidebar--collapsed { width: 80px; }

    .sidebar__logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      height: 64px;
      border-bottom: 1px solid var(--sidebar-border);
      flex-shrink: 0;
    }
    .sidebar__logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar__logo-icon mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }
    .sidebar__logo-text {
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      white-space: nowrap;
      letter-spacing: -0.02em;
    }

    .sidebar__nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar__nav::-webkit-scrollbar { width: 4px; }
    .sidebar__nav::-webkit-scrollbar-thumb { background: var(--sidebar-border); border-radius: 2px; }

    .nav-group { margin-bottom: 8px; }
    .nav-group__title {
      padding: 8px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--sidebar-text-muted);
      white-space: nowrap;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      color: var(--sidebar-text);
      text-decoration: none;
      transition: background 200ms ease, color 200ms ease;
      white-space: nowrap;
      cursor: pointer;
    }
    .nav-link:hover { background: var(--sidebar-hover); color: #fff; }
    .nav-link--active { background: #2563eb; color: #fff; }
    .nav-link--active:hover { background: #1d4ed8; color: #fff; }

    .nav-link__icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      flex-shrink: 0;
    }
    .nav-link__label { overflow: hidden; text-overflow: ellipsis; }

    .sidebar--collapsed .nav-link { justify-content: center; padding: 10px; }
    .sidebar--collapsed .nav-group__title { display: none; }

    .sidebar__footer {
      padding: 12px;
      border-top: 1px solid var(--sidebar-border);
      flex-shrink: 0;
    }
    .sidebar__toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--sidebar-text-muted);
      font-size: 14px;
      cursor: pointer;
      transition: background 200ms ease, color 200ms ease;
    }
    .sidebar__toggle:hover { background: var(--sidebar-hover); color: #fff; }
  `],
})
export class SidebarComponent {
  private _collapsed = signal(false);

  @Input() set collapsed(value: boolean) {
    this._collapsed.set(value);
  }
  get collapsed() {
    return this._collapsed();
  }
  @Output() collapsedChange = new EventEmitter<boolean>();

  private auth = inject(AuthService);

  navItems: NavGroup[] = [
    { label: "Dashboard", icon: "dashboard", route: "/app/dashboard" },
    {
      label: "Employee",
      icon: "person",
      children: [
        { label: "My Profile", icon: "account_circle", route: "/app/profile" },
        { label: "My Evaluations", icon: "rate_review", route: "/app/my-evaluations" },
        { label: "Goals", icon: "flag", route: "/app/goals" },
        { label: "Review History", icon: "history", route: "/app/review-history" },
      ],
    },
    {
      label: "Manager",
      icon: "groups",
      roles: ["manager", "hr_admin"],
      children: [
        { label: "Team Reviews", icon: "rate_review", route: "/app/team-reviews", roles: ["manager", "hr_admin"] },
        { label: "Team Performance", icon: "trending_up", route: "/app/team-performance", roles: ["manager", "hr_admin"] },
        { label: "Approvals", icon: "task_alt", route: "/app/approvals", roles: ["manager", "hr_admin"] },
      ],
    },
    {
      label: "Administration",
      icon: "admin_panel_settings",
      roles: ["hr_admin"],
      children: [
        { label: "Employees", icon: "badge", route: "/app/admin/employees", roles: ["hr_admin"] },
        { label: "Departments", icon: "account_tree", route: "/app/admin/departments", roles: ["hr_admin"] },
        { label: "Designations", icon: "work", route: "/app/admin/designations", roles: ["hr_admin"] },
        { label: "Templates", icon: "description", route: "/app/admin/templates", roles: ["hr_admin"] },
        { label: "Review Periods", icon: "event", route: "/app/admin/review-periods", roles: ["hr_admin"] },
        { label: "Roles", icon: "shield", route: "/app/admin/roles", roles: ["hr_admin"] },
        { label: "Users", icon: "manage_accounts", route: "/app/admin/users", roles: ["hr_admin"] },
      ],
    },
    { label: "Reports", icon: "assessment", route: "/app/reports" },
    { label: "Settings", icon: "settings", route: "/app/settings" },
    { label: "Help", icon: "help", route: "/app/help" },
  ];

  get visibleNavItems(): NavGroup[] {
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((r) => this.auth.hasRole(r as any));
    });
  }

  visibleChildren(group: NavGroup): NavChild[] {
    return (group.children ?? []).filter((child) => {
      if (!child.roles) return true;
      return child.roles.some((r) => this.auth.hasRole(r as any));
    });
  }

  toggleCollapsed(): void {
    this._collapsed.update((v) => !v);
    this.collapsedChange.emit(this._collapsed());
  }
}

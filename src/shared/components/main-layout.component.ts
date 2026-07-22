import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd, RouterOutlet } from "@angular/router";
import { filter } from "rxjs/operators";
import { SidebarComponent } from "./sidebar.component";
import { HeaderComponent } from "./header.component";
import { BreadcrumbComponent, BreadcrumbItem } from "./breadcrumb.component";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, BreadcrumbComponent],
  template: `
    <div class="layout">
      <app-sidebar [(collapsed)]="sidebarCollapsed" />

      <div class="layout__main" [class.layout__main--collapsed]="sidebarCollapsed">
        <app-header />

        <main class="layout__content">
          <app-breadcrumb [items]="breadcrumbs()" />
          <div class="layout__page">
            <router-outlet />
          </div>
        </main>

        <footer class="layout__footer">
          <span>HR Performance Hub &copy; 2026</span>
          <span class="layout__footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </span>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .layout { min-height: 100vh; background: var(--color-bg); }

    .layout__main {
      margin-left: 280px;
      transition: margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .layout__main--collapsed { margin-left: 80px; }

    .layout__content {
      flex: 1;
      padding: 24px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .layout__page { margin-top: 16px; }

    .layout__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      background: var(--color-surface);
      font-size: 13px;
      color: var(--color-text-muted);
    }
    .layout__footer-links { display: flex; gap: 16px; }
    .layout__footer-links a {
      color: var(--color-text-muted); text-decoration: none;
    }
    .layout__footer-links a:hover { color: #2563eb; }

    @media (max-width: 768px) {
      .layout__main { margin-left: 0 !important; }
      .layout__content { padding: 16px; }
    }
  `],
})
export class MainLayoutComponent {
  private router = inject(Router);

  sidebarCollapsed = false;
  breadcrumbs = signal<BreadcrumbItem[]>([{ label: "Dashboard" }]);

  private routeLabels: Record<string, string> = {
    "app/dashboard": "Dashboard",
    "app/profile": "My Profile",
    "app/my-evaluations": "My Evaluations",
    "app/goals": "Goals",
    "app/review-history": "Review History",
    "app/team-reviews": "Team Reviews",
    "app/team-performance": "Team Performance",
    "app/approvals": "Approvals",
    "app/admin": "Administration",
    "app/admin/employees": "Employees",
    "app/admin/departments": "Departments",
    "app/admin/designations": "Designations",
    "app/admin/templates": "Templates",
    "app/admin/review-periods": "Review Periods",
    "app/admin/roles": "Roles",
    "app/admin/users": "Users",
    "app/reports": "Reports",
    "app/settings": "Settings",
    "app/help": "Help",
  };

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => this.buildBreadcrumbs(e.urlAfterRedirects));
  }

  private buildBreadcrumbs(url: string): void {
    const parts = url.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];
    let path = "";
    for (const p of parts) {
      path += "/" + p;
      const label = this.routeLabels[path];
      if (label) crumbs.push({ label, url: path });
    }
    if (!crumbs.length) crumbs.push({ label: "Dashboard", url: "/app/dashboard" });
    this.breadcrumbs.set(crumbs);
  }
}

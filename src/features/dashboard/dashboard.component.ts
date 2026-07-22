import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { StatCardComponent } from "../../shared/components/stat-card.component";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../shared/components/status-badge.component";

interface ActivityItem {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
}

interface QuickAction {
  icon: string;
  title: string;
  subtitle: string;
  route: string;
  color: string;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, StatCardComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header
      title="Welcome, John Doe"
      subtitle="Your performance evaluation overview at a glance"
    />

    <!-- Stat Cards -->
    <div class="stat-grid">
      <app-stat-card icon="rate_review" [value]="248" label="Total Evaluations" color="primary" trend="+12% from last quarter" [trendPositive]="true" />
      <app-stat-card icon="edit_note" [value]="12" label="Draft Evaluations" color="warning" trend="3 awaiting submission" [trendPositive]="false" />
      <app-stat-card icon="pending_actions" [value]="7" label="Pending Reviews" color="danger" trend="2 overdue" [trendPositive]="false" />
      <app-stat-card icon="check_circle" [value]="229" label="Completed Reviews" color="success" trend="+8% completion rate" [trendPositive]="true" />
    </div>

    <!-- Two-column layout -->
    <div class="dash-grid">
      <!-- Recent Activity -->
      <div class="card card-body dash-card">
        <div class="card-header-row">
          <h3 class="card-title">Recent Activity</h3>
          <button mat-stroked-button class="btn-outline">View All</button>
        </div>
        <div class="activity-list">
          @for (item of recentActivity; track item.title) {
            <div class="activity-item">
              <div class="activity-item__icon" [class]="item.icon + '-bg'">
                <mat-icon>{{ item.icon }}</mat-icon>
              </div>
              <div class="activity-item__body">
                <div class="activity-item__title">{{ item.title }}</div>
                <div class="activity-item__subtitle">{{ item.subtitle }}</div>
              </div>
              <div class="activity-item__right">
                <app-status-badge [status]="item.status" />
                <span class="activity-item__time">{{ item.time }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Upcoming Review Period -->
      <div class="card card-body dash-card">
        <div class="card-header-row">
          <h3 class="card-title">Upcoming Review Period</h3>
        </div>
        <div class="period-card">
          <div class="period-card__icon">
            <mat-icon>event</mat-icon>
          </div>
          <div class="period-card__name">Q2 2026 Performance Review</div>
          <div class="period-card__date">April 1 – June 30, 2026</div>
          <div class="period-card__progress">
            <div class="period-card__progress-bar">
              <div class="period-card__progress-fill" style="width: 45%"></div>
            </div>
            <span class="period-card__progress-label">45% complete</span>
          </div>
          <div class="period-card__stats">
            <div><strong>142</strong> Submitted</div>
            <div><strong>38</strong> In Review</div>
            <div><strong>68</strong> Approved</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card card-body">
      <div class="card-header-row">
        <h3 class="card-title">Quick Actions</h3>
      </div>
      <div class="action-grid">
        @for (action of quickActions; track action.title) {
          <button class="action-card" (click)="navigate(action.route)">
            <div class="action-card__icon" [class]="'action-' + action.color">
              <mat-icon>{{ action.icon }}</mat-icon>
            </div>
            <div class="action-card__title">{{ action.title }}</div>
            <div class="action-card__subtitle">{{ action.subtitle }}</div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .dash-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .dash-card { padding: 0; overflow: hidden; }
    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .activity-list { padding: 8px; }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      transition: background 200ms ease;
    }
    .activity-item:hover { background: #f8fafc; }
    .activity-item__icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .activity-item__icon mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }
    .rate_review-bg { background: #dbeafe; color: #2563eb; }
    .edit_note-bg { background: #fef3c7; color: #d97706; }
    .check_circle-bg { background: #dcfce7; color: #16a34a; }
    .pending_actions-bg { background: #fee2e2; color: #dc2626; }
    .person-bg { background: #e0e7ff; color: #4f46e5; }

    .activity-item__body { flex: 1; min-width: 0; }
    .activity-item__title { font-size: 14px; font-weight: 500; color: #1e293b; }
    .activity-item__subtitle { font-size: 12px; color: #94a3b8; margin-top: 1px; }
    .activity-item__right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
      flex-shrink: 0;
    }
    .activity-item__time { font-size: 12px; color: #94a3b8; }

    .period-card { padding: 20px; text-align: center; }
    .period-card__icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: #dbeafe; color: #2563eb;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
    }
    .period-card__icon mat-icon { font-size: 28px !important; width: 28px !important; height: 28px !important; }
    .period-card__name { font-size: 16px; font-weight: 600; color: #0f172a; }
    .period-card__date { font-size: 13px; color: #64748b; margin-top: 4px; }
    .period-card__progress { margin-top: 16px; }
    .period-card__progress-bar {
      height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;
    }
    .period-card__progress-fill {
      height: 100%; background: #2563eb; border-radius: 4px;
      transition: width 400ms ease;
    }
    .period-card__progress-label {
      font-size: 12px; color: #64748b; margin-top: 6px; display: block;
    }
    .period-card__stats {
      display: flex; justify-content: space-around;
      margin-top: 20px; padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .period-card__stats div { font-size: 13px; color: #64748b; }
    .period-card__stats strong { display: block; font-size: 20px; color: #0f172a; }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 16px;
    }
    .action-card {
      display: flex; flex-direction: column; align-items: flex-start;
      gap: 8px; padding: 16px;
      border: 1px solid #e5e7eb; border-radius: 12px;
      background: #fff; cursor: pointer; text-align: left;
      transition: box-shadow 200ms ease, border-color 200ms ease;
    }
    .action-card:hover { border-color: #2563eb; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .action-card__icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .action-card__icon mat-icon { font-size: 22px !important; width: 22px !important; height: 22px !important; }
    .action-primary { background: #dbeafe; color: #2563eb; }
    .action-success { background: #dcfce7; color: #16a34a; }
    .action-warning { background: #fef3c7; color: #d97706; }
    .action-neutral { background: #f1f5f9; color: #64748b; }
    .action-card__title { font-size: 14px; font-weight: 600; color: #1e293b; }
    .action-card__subtitle { font-size: 12px; color: #94a3b8; }

    @media (max-width: 1024px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .dash-grid { grid-template-columns: 1fr; }
      .action-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .stat-grid { grid-template-columns: 1fr; }
      .action-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  private router = inject(Router);

  recentActivity: ActivityItem[] = [
    { icon: "rate_review", title: "Q1 2026 Self-Evaluation Submitted", subtitle: "Standard Performance Review", time: "2h ago", status: "submitted" },
    { icon: "check_circle", title: "Sarah Williams approved your evaluation", subtitle: "Q1 2026 Performance Review", time: "5h ago", status: "approved" },
    { icon: "edit_note", title: "Draft saved for Q2 2026", subtitle: "Standard Performance Review", time: "1d ago", status: "draft" },
    { icon: "pending_actions", title: "Mike Johnson submitted for review", subtitle: "Q1 2026 Performance Review", time: "2d ago", status: "in_review" },
    { icon: "person", title: "Profile updated", subtitle: "Phone number changed", time: "3d ago", status: "completed" },
  ];

  quickActions: QuickAction[] = [
    { icon: "add_circle", title: "Start Evaluation", subtitle: "Begin a new self-evaluation", route: "/app/my-evaluations", color: "primary" },
    { icon: "rate_review", title: "My Evaluations", subtitle: "View all your evaluations", route: "/app/my-evaluations", color: "success" },
    { icon: "flag", title: "Set Goals", subtitle: "Define your quarterly goals", route: "/app/goals", color: "warning" },
    { icon: "person", title: "My Profile", subtitle: "Update your personal info", route: "/app/profile", color: "neutral" },
  ];

  navigate(route: string): void { this.router.navigate([route]); }
}

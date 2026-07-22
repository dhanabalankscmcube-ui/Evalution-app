import { Component, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../shared/components/status-badge.component";

interface ReviewHistoryItem {
  id: string;
  period: string;
  template: string;
  submittedDate: string;
  approvedDate: string | null;
  status: string;
  overallScore: number | null;
  managerName: string;
  managerComment: string | null;
  ratingTrend: "up" | "down" | "same";
}

@Component({
  selector: "app-review-history",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatTooltipModule, PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Review History" subtitle="View your past performance evaluations"
      [breadcrumbs]="breadcrumbs" />

    <!-- Score Trend Card -->
    <div class="rh-trend-card">
      <div class="rh-trend-card__left">
        <div class="rh-trend-card__icon">
          <mat-icon>insights</mat-icon>
        </div>
        <div>
          <h3 class="rh-trend-card__title">Performance Trend</h3>
          <p class="rh-trend-card__desc">Your average score across all reviews: <strong>{{ avgScore() }}</strong> / 5.0</p>
        </div>
      </div>
      <div class="rh-trend-card__right">
        @for (score of scoreTrend(); track $index) {
          <div class="rh-trend-bar">
            <div class="rh-trend-bar__fill" [style.height.%]="score * 20"></div>
            <span class="rh-trend-bar__label">{{ score.toFixed(1) }}</span>
          </div>
        }
      </div>
    </div>

    <!-- History List -->
    <div class="rh-list">
      @for (item of history(); track item.id) {
        <div class="rh-card">
          <div class="rh-card__left">
            <div class="rh-card__score" [class.rh-card__score--high]="item.overallScore && item.overallScore >= 4"
              [class.rh-card__score--mid]="item.overallScore && item.overallScore >= 3 && item.overallScore < 4"
              [class.rh-card__score--low]="item.overallScore && item.overallScore < 3">
              @if (item.overallScore) {
                {{ item.overallScore.toFixed(1) }}
              } @else {
                <mat-icon>hourglass_empty</mat-icon>
              }
            </div>
            <div class="rh-card__info">
              <h3 class="rh-card__title">{{ item.period }}</h3>
              <p class="rh-card__template">{{ item.template }}</p>
              <div class="rh-card__meta">
                <span><mat-icon>send</mat-icon> Submitted: {{ item.submittedDate | date:'mediumDate' }}</span>
                @if (item.approvedDate) {
                  <span><mat-icon>check_circle</mat-icon> Approved: {{ item.approvedDate | date:'mediumDate' }}</span>
                }
                <span><mat-icon>supervisor_account</mat-icon> {{ item.managerName }}</span>
              </div>
            </div>
          </div>
          <div class="rh-card__right">
            @if (item.ratingTrend === 'up') {
              <mat-icon matTooltip="Score improved" class="rh-trend-icon rh-trend-icon--up">trending_up</mat-icon>
            } @else if (item.ratingTrend === 'down') {
              <mat-icon matTooltip="Score decreased" class="rh-trend-icon rh-trend-icon--down">trending_down</mat-icon>
            } @else {
              <mat-icon matTooltip="Score stable" class="rh-trend-icon rh-trend-icon--same">trending_flat</mat-icon>
            }
            <app-status-badge [status]="item.status" />
            <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="viewDetail(item)">
                <mat-icon>visibility</mat-icon> View Detail
              </button>
              <button mat-menu-item (click)="downloadReport(item)">
                <mat-icon>download</mat-icon> Download Report
              </button>
            </mat-menu>
          </div>
        </div>

        @if (item.managerComment) {
          <div class="rh-comment">
            <div class="rh-comment__header">
              <mat-icon>format_quote</mat-icon>
              <span>Manager Feedback from {{ item.managerName }}</span>
            </div>
            <p class="rh-comment__text">{{ item.managerComment }}</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .rh-trend-card {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;
    }
    .rh-trend-card__left { display: flex; align-items: center; gap: 16px; }
    .rh-trend-card__icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: #dbeafe; color: #2563eb;
      display: flex; align-items: center; justify-content: center;
    }
    .rh-trend-card__icon mat-icon { font-size: 24px !important; width: 24px !important; height: 24px !important; }
    .rh-trend-card__title { font-size: 16px; font-weight: 700; color: var(--color-text); margin: 0; }
    .rh-trend-card__desc { font-size: 14px; color: var(--color-text-muted); margin: 4px 0 0; }
    .rh-trend-card__right { display: flex; align-items: flex-end; gap: 12px; height: 60px; }
    .rh-trend-bar {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      width: 36px;
    }
    .rh-trend-bar__fill {
      width: 100%; min-height: 4px;
      background: linear-gradient(to top, #2563eb, #60a5fa);
      border-radius: 4px 4px 0 0;
      transition: height 300ms ease;
    }
    .rh-trend-bar__label { font-size: 10px; color: var(--color-text-muted); font-weight: 600; }

    .rh-list { display: flex; flex-direction: column; gap: 12px; }

    .rh-card {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 12px; padding: 18px 20px;
      transition: box-shadow 200ms ease;
    }
    .rh-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

    .rh-card__left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
    .rh-card__score {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; flex-shrink: 0;
    }
    .rh-card__score mat-icon { font-size: 24px !important; width: 24px !important; height: 24px !important; }
    .rh-card__score--high { background: #dcfce7; color: #16a34a; }
    .rh-card__score--mid { background: #dbeafe; color: #2563eb; }
    .rh-card__score--low { background: #fee2e2; color: #ef4444; }

    .rh-card__info { flex: 1; min-width: 0; }
    .rh-card__title { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
    .rh-card__template { font-size: 13px; color: var(--color-text-muted); margin: 2px 0 8px; }
    .rh-card__meta { display: flex; gap: 20px; flex-wrap: wrap; }
    .rh-card__meta span {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--color-text-muted);
    }
    .rh-card__meta mat-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; }

    .rh-card__right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .rh-trend-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }
    .rh-trend-icon--up { color: #16a34a; }
    .rh-trend-icon--down { color: #ef4444; }
    .rh-trend-icon--same { color: var(--color-text-muted); }

    .rh-comment {
      background: var(--color-bg); border: 1px solid var(--color-border);
      border-left: 4px solid #2563eb;
      border-radius: 10px; padding: 14px 18px; margin-top: -8px; margin-bottom: 12px; margin-left: 20px;
    }
    .rh-comment__header {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600; color: var(--color-text-muted); margin-bottom: 8px;
    }
    .rh-comment__header mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; color: #2563eb; }
    .rh-comment__text {
      font-size: 13px; color: var(--color-text); line-height: 1.6; margin: 0;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .rh-card { flex-direction: column; align-items: flex-start; gap: 14px; }
      .rh-card__right { width: 100%; justify-content: flex-end; }
      .rh-trend-card { flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  `],
})
export class ReviewHistoryComponent {
  breadcrumbs: any[] = [{ label: "Dashboard", url: "/app/dashboard" }, { label: "Review History" }];

  private _history = signal<ReviewHistoryItem[]>([
    {
      id: "h1", period: "Q1 2026 Performance Review", template: "Standard Quarterly Review",
      submittedDate: "2026-02-10", approvedDate: "2026-02-20", status: "approved",
      overallScore: 4.2, managerName: "Sarah Williams",
      managerComment: "Excellent work this quarter. John consistently delivered high-quality code and showed great initiative in leading the product launch. Keep up the momentum on cross-team collaboration.",
      ratingTrend: "up",
    },
    {
      id: "h2", period: "Q4 2025 Performance Review", template: "Standard Quarterly Review",
      submittedDate: "2025-12-15", approvedDate: "2025-12-28", status: "approved",
      overallScore: 3.8, managerName: "Sarah Williams",
      managerComment: "Strong technical contributions. Would like to see more proactive communication with stakeholders in the next quarter.",
      ratingTrend: "same",
    },
    {
      id: "h3", period: "Q3 2025 Performance Review", template: "Standard Quarterly Review",
      submittedDate: "2025-09-20", approvedDate: "2025-10-05", status: "approved",
      overallScore: 3.5, managerName: "Sarah Williams",
      managerComment: "Good progress on individual deliverables. Focus on improving estimation accuracy for sprint planning.",
      ratingTrend: "down",
    },
    {
      id: "h4", period: "Q2 2025 Performance Review", template: "Standard Quarterly Review",
      submittedDate: "2025-06-18", approvedDate: "2025-07-01", status: "approved",
      overallScore: 4.0, managerName: "Sarah Williams",
      managerComment: "Great improvement in code quality and testing. The refactoring initiative saved significant technical debt.",
      ratingTrend: "up",
    },
    {
      id: "h5", period: "Q1 2025 Performance Review", template: "Standard Quarterly Review",
      submittedDate: "2025-03-12", approvedDate: "2025-03-25", status: "approved",
      overallScore: 3.7, managerName: "Sarah Williams",
      managerComment: null, ratingTrend: "same",
    },
  ]);

  history = this._history.asReadonly();

  scoreTrend = computed(() => {
    return this._history()
      .filter((h) => h.overallScore !== null)
      .reverse()
      .map((h) => h.overallScore!);
  });

  avgScore = computed(() => {
    const scores = this._history().filter((h) => h.overallScore !== null).map((h) => h.overallScore!);
    if (scores.length === 0) return "—";
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  });

  viewDetail(item: ReviewHistoryItem) { /* navigate to detail view */ }
  downloadReport(item: ReviewHistoryItem) { /* trigger download in future iteration */ }
}

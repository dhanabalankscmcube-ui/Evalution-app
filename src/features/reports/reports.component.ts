import { Component, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PageHeaderComponent } from "../../shared/components/page-header.component";

interface ReportItem {
  id: string;
  title: string;
  type: string;
  generatedDate: string;
  recordCount: number;
  format: "PDF" | "Excel" | "CSV";
  status: "ready" | "generating" | "scheduled";
}

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    MatProgressSpinnerModule, MatMenuModule, MatTooltipModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Reports" subtitle="Generate and download performance reports"
      [breadcrumbs]="breadcrumbs" [hasActions]="true">
      <button mat-flat-button color="primary" (click)="generateReport()">
        <mat-icon>add</mat-icon> Generate Report
      </button>
    </app-page-header>

    <!-- Quick Stats -->
    <div class="rpt-stats">
      <div class="rpt-stat">
        <div class="rpt-stat__icon rpt-stat__icon--blue"><mat-icon>description</mat-icon></div>
        <div>
          <div class="rpt-stat__value">{{ reports().length }}</div>
          <div class="rpt-stat__label">Total Reports</div>
        </div>
      </div>
      <div class="rpt-stat">
        <div class="rpt-stat__icon rpt-stat__icon--green"><mat-icon>check_circle</mat-icon></div>
        <div>
          <div class="rpt-stat__value">{{ readyCount() }}</div>
          <div class="rpt-stat__label">Ready to Download</div>
        </div>
      </div>
      <div class="rpt-stat">
        <div class="rpt-stat__icon rpt-stat__icon--amber"><mat-icon>schedule</mat-icon></div>
        <div>
          <div class="rpt-stat__value">{{ scheduledCount() }}</div>
          <div class="rpt-stat__label">Scheduled</div>
        </div>
      </div>
    </div>

    <!-- Department Performance Summary -->
    <div class="rpt-section">
      <h3 class="rpt-section__title">
        <mat-icon>bar_chart</mat-icon> Department Performance Overview
      </h3>
      <div class="rpt-dept-list">
        @for (dept of deptPerformance(); track dept.name) {
          <div class="rpt-dept">
            <div class="rpt-dept__header">
              <span class="rpt-dept__name">{{ dept.name }}</span>
              <span class="rpt-dept__score">{{ dept.avgScore.toFixed(1) }} / 5.0</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="dept.avgScore * 20"
              [class.rpt-dept__bar--green]="dept.avgScore >= 4"
              [class.rpt-dept__bar--amber]="dept.avgScore >= 3 && dept.avgScore < 4"
              [class.rpt-dept__bar--red]="dept.avgScore < 3" />
            <div class="rpt-dept__meta">
              <span>{{ dept.employeeCount }} employees</span>
              <span>{{ dept.completedReviews }} reviews completed</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Report List -->
    <div class="rpt-section">
      <h3 class="rpt-section__title">
        <mat-icon>folder</mat-icon> Generated Reports
      </h3>
      <div class="rpt-list">
        @for (r of reports(); track r.id) {
          <div class="rpt-card">
            <div class="rpt-card__icon rpt-card__icon--{{ r.format.toLowerCase() }}">
              <span>{{ r.format }}</span>
            </div>
            <div class="rpt-card__info">
              <h4 class="rpt-card__title">{{ r.title }}</h4>
              <p class="rpt-card__type">{{ r.type }}</p>
              <div class="rpt-card__meta">
                <span><mat-icon>event</mat-icon> {{ r.generatedDate | date:'mediumDate' }}</span>
                <span><mat-icon>data_usage</mat-icon> {{ r.recordCount }} records</span>
              </div>
            </div>
            <div class="rpt-card__actions">
              @if (r.status === 'ready') {
                <button mat-icon-button matTooltip="Download" (click)="download(r)">
                  <mat-icon>download</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Share" (click)="share(r)">
                  <mat-icon>share</mat-icon>
                </button>
              } @else if (r.status === 'generating') {
                <span class="rpt-card__status rpt-card__status--gen">
                  <mat-progress-spinner diameter="16" mode="indeterminate" />
                  Generating…
                </span>
              } @else {
                <span class="rpt-card__status rpt-card__status--sched">
                  <mat-icon>schedule</mat-icon> Scheduled
                </span>
              }
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="download(r)" [disabled]="r.status !== 'ready'">
                  <mat-icon>download</mat-icon> Download
                </button>
                <button mat-menu-item (click)="schedule(r)">
                  <mat-icon>schedule_send</mat-icon> Schedule Recurring
                </button>
                <button mat-menu-item (click)="deleteReport(r.id)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-menu>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .rpt-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px;
    }
    .rpt-stat {
      display: flex; align-items: center; gap: 14px;
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 12px; padding: 18px 20px;
    }
    .rpt-stat__icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .rpt-stat__icon mat-icon { font-size: 22px !important; width: 22px !important; height: 22px !important; }
    .rpt-stat__icon--blue { background: #dbeafe; color: #2563eb; }
    .rpt-stat__icon--green { background: #dcfce7; color: #16a34a; }
    .rpt-stat__icon--amber { background: #fef3c7; color: #d97706; }
    .rpt-stat__value { font-size: 24px; font-weight: 800; color: var(--color-text); }
    .rpt-stat__label { font-size: 12px; color: var(--color-text-muted); font-weight: 600; }

    .rpt-section {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 12px; padding: 20px; margin-bottom: 20px;
    }
    .rpt-section__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; font-weight: 700; color: var(--color-text);
      margin: 0 0 16px;
    }
    .rpt-section__title mat-icon {
      font-size: 20px !important; width: 20px !important; height: 20px !important; color: #2563eb;
    }

    .rpt-dept-list { display: flex; flex-direction: column; gap: 14px; }
    .rpt-dept__header {
      display: flex; justify-content: space-between; margin-bottom: 6px;
    }
    .rpt-dept__name { font-size: 14px; font-weight: 600; color: var(--color-text); }
    .rpt-dept__score { font-size: 14px; font-weight: 700; color: var(--color-text); }
    .rpt-dept__meta {
      display: flex; gap: 20px; margin-top: 6px;
      font-size: 12px; color: var(--color-text-muted);
    }

    .rpt-list { display: flex; flex-direction: column; gap: 10px; }
    .rpt-card {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: var(--color-bg); border: 1px solid var(--color-border);
      border-radius: 10px;
      transition: border-color 200ms ease;
    }
    .rpt-card:hover { border-color: rgba(37, 99, 235, 0.2); }

    .rpt-card__icon {
      width: 44px; height: 52px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 800; flex-shrink: 0;
      clip-path: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%);
    }
    .rpt-card__icon--pdf { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .rpt-card__icon--excel { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
    .rpt-card__icon--csv { background: #dbeafe; color: #2563eb; border: 1px solid #93c5fd; }

    .rpt-card__info { flex: 1; min-width: 0; }
    .rpt-card__title { font-size: 14px; font-weight: 700; color: var(--color-text); margin: 0; }
    .rpt-card__type { font-size: 12px; color: var(--color-text-muted); margin: 2px 0 6px; }
    .rpt-card__meta { display: flex; gap: 16px; }
    .rpt-card__meta span {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--color-text-disabled);
    }
    .rpt-card__meta mat-icon { font-size: 14px !important; width: 14px !important; height: 14px !important; }

    .rpt-card__actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .rpt-card__status {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; padding: 0 8px;
    }
    .rpt-card__status--gen { color: var(--color-text-muted); }
    .rpt-card__status--sched { color: #d97706; }
    .rpt-card__status--sched mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }

    @media (max-width: 768px) {
      .rpt-stats { grid-template-columns: 1fr; }
      .rpt-card { flex-direction: column; align-items: flex-start; }
      .rpt-card__actions { width: 100%; justify-content: flex-end; }
    }
  `],
})
export class ReportsComponent {
  breadcrumbs: any[] = [{ label: "Dashboard", url: "/app/dashboard" }, { label: "Reports" }];

  private _reports = signal<ReportItem[]>([
    {
      id: "r1", title: "Q1 2026 Performance Summary", type: "Quarterly Evaluation Report",
      generatedDate: "2026-04-05", recordCount: 48, format: "PDF", status: "ready",
    },
    {
      id: "r2", title: "Department Performance Breakdown", type: "Department Analytics",
      generatedDate: "2026-04-03", recordCount: 6, format: "Excel", status: "ready",
    },
    {
      id: "r3", title: "Employee Goal Completion Report", type: "Goals & Objectives",
      generatedDate: "2026-04-01", recordCount: 120, format: "CSV", status: "ready",
    },
    {
      id: "r4", title: "Manager Review Effectiveness", type: "Manager Performance Analytics",
      generatedDate: "2026-03-28", recordCount: 12, format: "PDF", status: "ready",
    },
    {
      id: "r5", title: "Training Needs Assessment", type: "Learning & Development",
      generatedDate: "2026-03-25", recordCount: 85, format: "Excel", status: "ready",
    },
    {
      id: "r6", title: "Q2 2026 Mid-Quarter Snapshot", type: "Real-time Dashboard Export",
      generatedDate: "2026-07-15", recordCount: 52, format: "PDF", status: "generating",
    },
    {
      id: "r7", title: "Annual Performance Review Compilation", type: "Year-End Summary",
      generatedDate: "2026-12-31", recordCount: 0, format: "PDF", status: "scheduled",
    },
  ]);

  reports = this._reports.asReadonly();
  readyCount = computed(() => this._reports().filter((r) => r.status === "ready").length);
  scheduledCount = computed(() => this._reports().filter((r) => r.status === "scheduled").length);

  deptPerformance = signal([
    { name: "Engineering", avgScore: 4.2, employeeCount: 24, completedReviews: 22 },
    { name: "Product", avgScore: 4.0, employeeCount: 8, completedReviews: 7 },
    { name: "Design", avgScore: 4.3, employeeCount: 6, completedReviews: 6 },
    { name: "Sales", avgScore: 3.5, employeeCount: 15, completedReviews: 12 },
    { name: "Marketing", avgScore: 3.8, employeeCount: 10, completedReviews: 9 },
    { name: "Operations", avgScore: 3.9, employeeCount: 12, completedReviews: 10 },
  ]).asReadonly();

  generateReport() { /* open report wizard in future iteration */ }
  download(r: ReportItem) { /* trigger download */ }
  share(r: ReportItem) { /* open share dialog */ }
  schedule(r: ReportItem) { /* open schedule dialog */ }
  deleteReport(id: string) {
    this._reports.update((list) => list.filter((r) => r.id !== id));
  }
}

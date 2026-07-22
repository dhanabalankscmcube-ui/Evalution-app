import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../shared/components/status-badge.component";
import { ToastService } from "../../core/services/toast.service";
import { EvaluationService, EmployeeService } from "../../core/services/domain.services";
import { AuthService } from "../../core/auth/auth.service";
import type { EmployeeEvaluation } from "../../core/models";

@Component({
  selector: "app-my-evaluation-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatMenuModule, MatTooltipModule, PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="My Evaluations" subtitle="View and manage your self-evaluations"
      [breadcrumbs]="breadcrumbs" [hasActions]="true">
      <button mat-flat-button color="primary" (click)="startNew()">
        <mat-icon>add</mat-icon> Start Evaluation
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="eval-loading">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (evaluations().length === 0) {
      <div class="eval-empty">
        <div class="eval-empty__icon">
          <mat-icon>rate_review</mat-icon>
        </div>
        <h3 class="eval-empty__title">No evaluations yet</h3>
        <p class="eval-empty__desc">Start your first self-evaluation to begin the review process.</p>
        <button mat-flat-button color="primary" (click)="startNew()">
          <mat-icon>add</mat-icon> Start Evaluation
        </button>
      </div>
    } @else {
      <div class="eval-grid">
        @for (ev of evaluations(); track ev.id) {
          <div class="eval-card" (click)="openCard(ev)">
            <div class="eval-card__header">
              <div class="eval-card__period-icon">
                <mat-icon>{{ getStatusIcon(ev.status) }}</mat-icon>
              </div>
              <div class="eval-card__info">
                <h3 class="eval-card__title">{{ ev.review_period?.name || 'Evaluation' }}</h3>
                <p class="eval-card__template">{{ ev.template?.name }}</p>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()"
                matTooltip="More options" class="eval-card__menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                @if (ev.status === 'draft' || ev.status === 'changes_requested') {
                  <button mat-menu-item (click)="open(ev)">
                    <mat-icon>edit</mat-icon> Continue
                  </button>
                }
                @if (ev.status !== 'draft') {
                  <button mat-menu-item (click)="view(ev)">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                }
                @if (ev.status === 'draft') {
                  <button mat-menu-item (click)="open(ev)">
                    <mat-icon>edit_note</mat-icon> Edit &amp; Submit
                  </button>
                }
              </mat-menu>
            </div>

            <div class="eval-card__body">
              <div class="eval-card__meta">
                <div class="eval-card__meta-item">
                  <mat-icon>event</mat-icon>
                  <span>{{ ev.created_at | date:'mediumDate' }}</span>
                </div>
                @if (ev.overall_score) {
                  <div class="eval-card__meta-item">
                    <mat-icon>star</mat-icon>
                    <span>{{ ev.overall_score }}/5.0</span>
                  </div>
                }
              </div>

              <div class="eval-card__status-row">
                <app-status-badge [status]="ev.status" />
                @if (ev.manager_review) {
                  <div class="eval-card__mgr-badge">
                    <mat-icon>how_to_reg</mat-icon>
                    Manager reviewed
                  </div>
                }
              </div>
            </div>

            @if (ev.status === 'draft') {
              <div class="eval-card__footer eval-card__footer--draft">
                <span>In progress — click to continue</span>
                <mat-icon>arrow_forward</mat-icon>
              </div>
            } @else if (ev.status === 'changes_requested') {
              <div class="eval-card__footer eval-card__footer--changes">
                <span>Changes requested — click to revise</span>
                <mat-icon>undo</mat-icon>
              </div>
            } @else if (ev.status === 'submitted') {
              <div class="eval-card__footer eval-card__footer--submitted">
                <span>Awaiting manager review</span>
                <mat-icon>hourglass_top</mat-icon>
              </div>
            } @else if (ev.status === 'approved') {
              <div class="eval-card__footer eval-card__footer--approved">
                <span>Approved</span>
                <mat-icon>check_circle</mat-icon>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .eval-loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }

    .eval-empty {
      text-align: center;
      padding: 60px 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
    }
    .eval-empty__icon {
      width: 64px; height: 64px; border-radius: 16px;
      background: rgba(37, 99, 235, 0.08);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .eval-empty__icon mat-icon { font-size: 32px !important; width: 32px !important; height: 32px !important; color: #2563eb; }
    .eval-empty__title { font-size: 18px; font-weight: 700; color: var(--color-text); margin: 0 0 4px; }
    .eval-empty__desc { font-size: 14px; color: var(--color-text-muted); margin: 0 0 20px; }

    .eval-grid { display: flex; flex-direction: column; gap: 14px; }

    .eval-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease;
    }
    .eval-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border-color: rgba(37, 99, 235, 0.3);
      transform: translateY(-1px);
    }

    .eval-card__header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 20px 14px;
    }
    .eval-card__period-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .eval-card__period-icon mat-icon { font-size: 22px !important; width: 22px !important; height: 22px !important; }
    .eval-card__info { flex: 1; min-width: 0; }
    .eval-card__title {
      font-size: 15px; font-weight: 700; color: var(--color-text);
      margin: 0; line-height: 1.3;
    }
    .eval-card__template {
      font-size: 13px; color: var(--color-text-muted); margin: 2px 0 0;
    }
    .eval-card__menu { color: var(--color-text-muted); }

    .eval-card__body { padding: 0 20px 16px; }
    .eval-card__meta {
      display: flex; gap: 20px; margin-bottom: 12px;
    }
    .eval-card__meta-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--color-text-muted);
    }
    .eval-card__meta-item mat-icon {
      font-size: 16px !important; width: 16px !important; height: 16px !important;
    }

    .eval-card__status-row {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .eval-card__mgr-badge {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600;
      color: #16a34a; background: #dcfce7;
      padding: 4px 10px; border-radius: 20px;
    }
    .eval-card__mgr-badge mat-icon {
      font-size: 14px !important; width: 14px !important; height: 14px !important;
    }

    .eval-card__footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px;
      font-size: 12px; font-weight: 600;
      border-top: 1px solid var(--color-border);
    }
    .eval-card__footer mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }
    .eval-card__footer--draft { background: rgba(37, 99, 235, 0.04); color: #2563eb; }
    .eval-card__footer--changes { background: #fef3c7; color: #d97706; }
    .eval-card__footer--submitted { background: #f0f9ff; color: #0284c7; }
    .eval-card__footer--approved { background: #dcfce7; color: #16a34a; }
  `],
})
export class MyEvaluationListComponent {
  private evalService = inject(EvaluationService);
  private employeeService = inject(EmployeeService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  evaluations = signal<EmployeeEvaluation[]>([]);
  loading = signal(false);

  breadcrumbs: any[] = [{ label: "Dashboard", url: "/app/dashboard" }, { label: "My Evaluations" }];

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const user = this.auth.user();
      if (!user) return;
      const emp = await this.employeeService.getByUserId(user.id);
      if (!emp) {
        this.toast.warning("No employee profile found for your account.");
        return;
      }
      this.evaluations.set(await this.evalService.getMyEvaluations(emp.id));
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      draft: "edit_note",
      submitted: "send",
      approved: "check_circle",
      changes_requested: "undo",
      in_review: "rate_review",
    };
    return icons[status] ?? "rate_review";
  }

  startNew() {
    this.router.navigate(["/app/my-evaluations/new"]);
  }

  openCard(ev: EmployeeEvaluation) {
    if (ev.status === "draft" || ev.status === "changes_requested") {
      this.open(ev);
    } else {
      this.view(ev);
    }
  }

  open(ev: EmployeeEvaluation) {
    this.router.navigate(["/app/my-evaluations", ev.id, "edit"]);
  }

  view(ev: EmployeeEvaluation) {
    this.router.navigate(["/app/my-evaluations", ev.id]);
  }
}

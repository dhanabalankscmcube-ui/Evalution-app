import { Component, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PageHeaderComponent } from "../../shared/components/page-header.component";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "completed";
  priority: "low" | "medium" | "high";
}

@Component({
  selector: "app-goals",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatProgressBarModule, MatTooltipModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="My Goals" subtitle="Set and track your quarterly performance goals"
      [breadcrumbs]="breadcrumbs" [hasActions]="true">
      <button mat-flat-button color="primary" (click)="addGoal()">
        <mat-icon>add</mat-icon> Add Goal
      </button>
    </app-page-header>

    <!-- Summary Stats -->
    <div class="goal-stats">
      <div class="goal-stat">
        <div class="goal-stat__value">{{ goals().length }}</div>
        <div class="goal-stat__label">Total Goals</div>
      </div>
      <div class="goal-stat goal-stat--green">
        <div class="goal-stat__value">{{ completedCount() }}</div>
        <div class="goal-stat__label">Completed</div>
      </div>
      <div class="goal-stat goal-stat--blue">
        <div class="goal-stat__value">{{ onTrackCount() }}</div>
        <div class="goal-stat__label">On Track</div>
      </div>
      <div class="goal-stat goal-stat--amber">
        <div class="goal-stat__value">{{ atRiskCount() }}</div>
        <div class="goal-stat__label">At Risk</div>
      </div>
    </div>

    <!-- Goals Grid -->
    <div class="goal-list">
      @for (g of goals(); track g.id) {
        <div class="goal-card" [class.goal-card--completed]="g.status === 'completed'">
          <div class="goal-card__header">
            <div class="goal-card__cat-icon" [class]="'goal-card__cat-icon--' + g.category.toLowerCase()">
              <mat-icon>{{ getCategoryIcon(g.category) }}</mat-icon>
            </div>
            <div class="goal-card__info">
              <h3 class="goal-card__title">{{ g.title }}</h3>
              <p class="goal-card__desc">{{ g.description }}</p>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="editGoal(g)">
                <mat-icon>edit</mat-icon> Edit
              </button>
              <button mat-menu-item (click)="deleteGoal(g.id)">
                <mat-icon>delete</mat-icon> Delete
              </button>
            </mat-menu>
          </div>

          <div class="goal-card__meta">
            <div class="goal-card__meta-item">
              <mat-icon>category</mat-icon>
              <span>{{ g.category }}</span>
            </div>
            <div class="goal-card__meta-item">
              <mat-icon>event</mat-icon>
              <span>Due: {{ g.dueDate | date:'mediumDate' }}</span>
            </div>
            <div class="goal-card__meta-item">
              <mat-icon>flag</mat-icon>
              <span class="goal-card__priority goal-card__priority--{{ g.priority }}">{{ g.priority }}</span>
            </div>
          </div>

          <div class="goal-card__progress">
            <div class="goal-card__progress-header">
              <span>Progress</span>
              <span class="goal-card__progress-value">{{ g.progress }}%</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="g.progress"
              [class.goal-card__progress-bar--green]="g.status === 'completed'"
              [class.goal-card__progress-bar--amber]="g.status === 'at_risk'"
              [class.goal-card__progress-bar--red]="g.status === 'behind'" />
          </div>

          <div class="goal-card__footer">
            <span class="goal-status goal-status--{{ g.status }}">
              <mat-icon>{{ getStatusIcon(g.status) }}</mat-icon>
              {{ getStatusLabel(g.status) }}
            </span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .goal-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;
    }
    .goal-stat {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 12px; padding: 18px 20px; text-align: center;
    }
    .goal-stat__value { font-size: 28px; font-weight: 800; color: var(--color-text); }
    .goal-stat__label { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; font-weight: 600; }
    .goal-stat--green .goal-stat__value { color: #16a34a; }
    .goal-stat--blue .goal-stat__value { color: #2563eb; }
    .goal-stat--amber .goal-stat__value { color: #d97706; }

    .goal-list { display: flex; flex-direction: column; gap: 14px; }

    .goal-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: 12px; padding: 20px;
      transition: box-shadow 200ms ease, border-color 200ms ease;
    }
    .goal-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); border-color: rgba(37, 99, 235, 0.2); }
    .goal-card--completed { border-left: 4px solid #22c55e; }

    .goal-card__header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
    .goal-card__cat-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .goal-card__cat-icon mat-icon { font-size: 22px !important; width: 22px !important; height: 22px !important; }
    .goal-card__cat-icon--performance { background: #dbeafe; color: #2563eb; }
    .goal-card__cat-icon--learning { background: #dcfce7; color: #16a34a; }
    .goal-card__cat-icon--leadership { background: #fef3c7; color: #d97706; }
    .goal-card__cat-icon--innovation { background: #e0e7ff; color: #4f46e5; }
    .goal-card__cat-icon--collaboration { background: #fce7f3; color: #db2777; }

    .goal-card__info { flex: 1; min-width: 0; }
    .goal-card__title { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
    .goal-card__desc { font-size: 13px; color: var(--color-text-muted); margin: 4px 0 0; line-height: 1.5; }

    .goal-card__meta {
      display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 14px;
    }
    .goal-card__meta-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--color-text-muted);
    }
    .goal-card__meta-item mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .goal-card__priority { font-weight: 700; text-transform: capitalize; }
    .goal-card__priority--high { color: #ef4444; }
    .goal-card__priority--medium { color: #d97706; }
    .goal-card__priority--low { color: #16a34a; }

    .goal-card__progress { margin-bottom: 14px; }
    .goal-card__progress-header {
      display: flex; justify-content: space-between;
      font-size: 12px; font-weight: 600; color: var(--color-text-muted); margin-bottom: 6px;
    }
    .goal-card__progress-value { color: var(--color-text); }

    .goal-card__footer { display: flex; align-items: center; }
    .goal-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600;
      padding: 4px 12px; border-radius: 20px;
    }
    .goal-status mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .goal-status--on_track { background: #dbeafe; color: #2563eb; }
    .goal-status--at_risk { background: #fef3c7; color: #d97706; }
    .goal-status--behind { background: #fee2e2; color: #ef4444; }
    .goal-status--completed { background: #dcfce7; color: #16a34a; }

    @media (max-width: 768px) {
      .goal-stats { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class GoalsComponent {
  breadcrumbs: any[] = [{ label: "Dashboard", url: "/app/dashboard" }, { label: "Goals" }];

  private _goals = signal<Goal[]>([
    {
      id: "g1", title: "Complete Q2 Product Launch",
      description: "Lead the cross-functional team to deliver the new product feature by end of Q2.",
      category: "Performance", dueDate: "2026-06-30", progress: 75, status: "on_track", priority: "high",
    },
    {
      id: "g2", title: "Obtain AWS Solutions Architect Certification",
      description: "Complete the AWS SA Associate certification exam and apply cloud best practices.",
      category: "Learning", dueDate: "2026-08-15", progress: 40, status: "on_track", priority: "medium",
    },
    {
      id: "g3", title: "Mentor 2 Junior Team Members",
      description: "Provide weekly mentoring sessions to help junior developers grow their skills.",
      category: "Leadership", dueDate: "2026-09-30", progress: 60, status: "on_track", priority: "medium",
    },
    {
      id: "g4", title: "Reduce Code Review Turnaround Time",
      description: "Improve code review SLA from 48h to 24h average turnaround.",
      category: "Performance", dueDate: "2026-07-31", progress: 20, status: "at_risk", priority: "high",
    },
    {
      id: "g5", title: "Propose Process Improvement Initiative",
      description: "Research and propose a new CI/CD pipeline improvement to reduce deployment time.",
      category: "Innovation", dueDate: "2026-07-15", progress: 100, status: "completed", priority: "low",
    },
    {
      id: "g6", title: "Improve Cross-Team Communication",
      description: "Establish bi-weekly sync meetings with the Design and QA teams.",
      category: "Collaboration", dueDate: "2026-06-15", progress: 50, status: "at_risk", priority: "medium",
    },
  ]);

  goals = this._goals.asReadonly();
  completedCount = computed(() => this._goals().filter((g) => g.status === "completed").length);
  onTrackCount = computed(() => this._goals().filter((g) => g.status === "on_track").length);
  atRiskCount = computed(() => this._goals().filter((g) => g.status === "at_risk").length);

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      Performance: "trending_up", Learning: "school", Leadership: "groups",
      Innovation: "lightbulb", Collaboration: "handshake",
    };
    return icons[cat] ?? "flag";
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      on_track: "trending_up", at_risk: "warning", behind: "error", completed: "check_circle",
    };
    return icons[status] ?? "flag";
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      on_track: "On Track", at_risk: "At Risk", behind: "Behind", completed: "Completed",
    };
    return labels[status] ?? status;
  }

  addGoal() { /* navigate to goal form in a future iteration */ }
  editGoal(g: Goal) { /* navigate to goal edit */ }
  deleteGoal(id: string) {
    this._goals.update((list) => list.filter((g) => g.id !== id));
  }
}

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../shared/components/status-badge.component";
import { ToastService } from "../../core/services/toast.service";
import {
  EmployeeService,
  EvaluationService,
  ManagerReviewService,
} from "../../core/services/domain.services";
import { AuthService } from "../../core/auth/auth.service";
import type {
  Employee,
  EmployeeEvaluation,
  EvaluationSection,
  ManagerReview,
} from "../../core/models";

@Component({
  selector: "app-team-review-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Team Reviews" subtitle="Review evaluations submitted by your team members"
      [breadcrumbs]="breadcrumbs" />

    @if (loading()) {
      <div class="tr-loading">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (!manager()) {
      <div class="tr-warning">
        <mat-icon>warning</mat-icon>
        <p>No manager profile found for your account.</p>
      </div>
    } @else if (team().length === 0) {
      <div class="tr-empty">
        <div class="tr-empty__icon"><mat-icon>groups</mat-icon></div>
        <p>No team members assigned to you.</p>
      </div>
    } @else {
      <div class="tr-list">
        @for (emp of team(); track emp.id) {
          <div class="tr-card">
            <div class="tr-card__left">
              <div class="tr-card__avatar">{{ emp.first_name[0] }}{{ emp.last_name[0] }}</div>
              <div class="tr-card__info">
                <h3 class="tr-card__name">{{ emp.first_name }} {{ emp.last_name }}</h3>
                <p class="tr-card__role">{{ emp.designation?.name || '—' }} · {{ emp.department?.name || '—' }}</p>
              </div>
            </div>
            <div class="tr-card__right">
              @if (getEvaluation(emp.id); as ev) {
                <app-status-badge [status]="ev.status" />
                @if (ev.status === 'submitted') {
                  <button mat-flat-button color="primary" (click)="openReview(ev)">
                    <mat-icon>rate_review</mat-icon> Review Now
                  </button>
                } @else if (ev.status === 'in_review') {
                  <button mat-flat-button color="primary" (click)="openReview(ev)">
                    <mat-icon>edit</mat-icon> Continue Review
                  </button>
                } @else {
                  <button mat-stroked-button (click)="openReview(ev)">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                }
              } @else {
                <span class="tr-card__pending">No evaluation submitted</span>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .tr-loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }

    .tr-warning {
      display: flex; align-items: center; gap: 10px;
      padding: 20px; border-radius: 12px;
      background: #fef3c7; border: 1px solid #fcd34d; color: #92400e;
    }
    .tr-warning mat-icon { color: #d97706; }

    .tr-empty {
      text-align: center; padding: 60px 20px;
      background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px;
    }
    .tr-empty__icon {
      width: 64px; height: 64px; border-radius: 16px;
      background: rgba(37, 99, 235, 0.08);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .tr-empty__icon mat-icon { font-size: 32px !important; width: 32px !important; height: 32px !important; color: #2563eb; }
    .tr-empty p { color: var(--color-text-muted); font-size: 14px; }

    .tr-list { display: flex; flex-direction: column; gap: 12px; }

    .tr-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      transition: box-shadow 200ms ease, border-color 200ms ease;
    }
    .tr-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-color: rgba(37, 99, 235, 0.2); }

    .tr-card__left { display: flex; align-items: center; gap: 14px; }
    .tr-card__avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: #2563eb; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0;
    }
    .tr-card__name { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
    .tr-card__role { font-size: 13px; color: var(--color-text-muted); margin: 2px 0 0; }

    .tr-card__right { display: flex; align-items: center; gap: 12px; }
    .tr-card__pending { font-size: 13px; color: var(--color-text-disabled); }

    @media (max-width: 640px) {
      .tr-card { flex-direction: column; align-items: flex-start; gap: 14px; }
      .tr-card__right { width: 100%; justify-content: flex-end; }
    }
  `],
})
export class TeamReviewListComponent {
  private employeeService = inject(EmployeeService);
  private evalService = inject(EvaluationService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  manager = signal<Employee | null>(null);
  team = signal<Employee[]>([]);
  evaluations = signal<EmployeeEvaluation[]>([]);

  breadcrumbs: any[] = [{ label: "Dashboard", url: "/app/dashboard" }, { label: "Team Reviews" }];

  async ngOnInit() {
    this.loading.set(true);
    try {
      const user = this.auth.user();
      if (!user) return;
      const mgr = await this.employeeService.getByUserId(user.id);
      this.manager.set(mgr);
      if (mgr) {
        const [team, evals] = await Promise.all([
          this.employeeService.getTeamMembers(mgr.id),
          this.evalService.getAllEvaluations({}),
        ]);
        this.team.set(team);
        this.evaluations.set(evals);
      }
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  getEvaluation(empId: string): EmployeeEvaluation | undefined {
    return this.evaluations().find((e) => e.employee_id === empId);
  }

  openReview(ev: EmployeeEvaluation) {
    this.router.navigate(["/app/team-reviews", ev.id]);
  }
}

@Component({
  selector: "app-manager-review-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatRadioModule, MatProgressSpinnerModule,
    MatExpansionModule, MatProgressBarModule, PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Review Evaluation"
      [subtitle]="employeeName()" [breadcrumbs]="breadcrumbs">
      @if (evaluation()) {
        <app-status-badge [status]="evaluation()!.status" />
      }
    </app-page-header>

    @if (loading()) {
      <div class="mrf-loading">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (evaluation()) {
      <div class="mrf-container">
        <!-- Employee Info Banner -->
        <div class="mrf-employee-banner">
          <div class="mrf-employee-banner__avatar">
            {{ evaluation()?.employee?.first_name?.[0] }}{{ evaluation()?.employee?.last_name?.[0] }}
          </div>
          <div class="mrf-employee-banner__info">
            <h2 class="mrf-employee-banner__name">{{ employeeName() }}</h2>
            <p class="mrf-employee-banner__meta">
              {{ evaluation()?.employee?.designation?.name }} ·
              {{ evaluation()?.employee?.department?.name }}
            </p>
          </div>
          <div class="mrf-employee-banner__date">
            <mat-icon>event</mat-icon>
            <span>Submitted: {{ evaluation()?.submitted_at | date:'mediumDate' }}</span>
          </div>
        </div>

        <div class="mrf-grid">
          <!-- Left: Employee Responses -->
          <div class="mrf-sections">
            <h3 class="mrf-sections-title">
              <mat-icon>person</mat-icon>
              Employee Self-Evaluation
            </h3>

            @for (section of sections(); track section.id; let si = $index) {
              <mat-expansion-panel [expanded]="true">
                <mat-expansion-panel-header>
                  <mat-panel-title class="mrf-panel-title">
                    {{ si + 1 }}. {{ section.title }}
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="mrf-questions">
                  @for (q of section.questions; track q.id; let qi = $index) {
                    <div class="mrf-question">
                      <div class="mrf-question__header">
                        <span class="mrf-question__num">Q{{ qi + 1 }}</span>
                        <div class="mrf-question__text">
                          <span class="mrf-question__label">{{ q.text }}</span>
                          @if (q.description) {
                            <span class="mrf-question__desc">{{ q.description }}</span>
                          }
                        </div>
                      </div>
                      <div class="mrf-question__answer">
                        <span class="mrf-question__answer-label">Employee Response:</span>
                        <span class="mrf-question__answer-value">{{ getEmployeeAnswer(q) }}</span>
                      </div>
                    </div>
                  }
                </div>
              </mat-expansion-panel>
            }
          </div>

          <!-- Right: Manager Review Form -->
          <div class="mrf-review" [formGroup]="form">
            <h3 class="mrf-review-title">
              <mat-icon>rate_review</mat-icon>
              Manager Review
            </h3>

            <p class="mrf-review-hint">Rate each competency and provide feedback comments.</p>

            <div class="mrf-review-questions">
              @for (section of sections(); track section.id; let si = $index) {
                <div class="mrf-review-section">
                  <h4 class="mrf-review-section__title">{{ section.title }}</h4>
                  @for (q of section.questions; track q.id) {
                    @if (q.question_type === 'rating') {
                      <div class="mrf-rate-block">
                        <label class="mrf-rate-label">{{ q.text }}</label>
                        <mat-radio-group [formControlName]="q.id" class="mrf-rate-row">
                          @for (r of getRatingRange(q); track r) {
                            <label class="mrf-rate-pill">
                              <mat-radio-button [value]="r" />
                              <span>{{ r }}</span>
                            </label>
                          }
                        </mat-radio-group>
                        <mat-form-field appearance="outline" class="mrf-rate-comment">
                          <mat-label>Comment (optional)</mat-label>
                          <textarea matInput [formControlName]="q.id + '_comment'" rows="2"></textarea>
                        </mat-form-field>
                      </div>
                    }
                  }
                </div>
              }
            </div>

            <div class="mrf-overall">
              <label class="mrf-overall__label">Overall Manager Comment</label>
              <mat-form-field appearance="outline" class="mrf-overall__field">
                <textarea matInput formControlName="_overall_comment" rows="4"
                  placeholder="Provide overall feedback to the employee..."></textarea>
              </mat-form-field>
            </div>

            <!-- Actions -->
            <div class="mrf-actions">
              <button mat-stroked-button (click)="saveProgress()" [disabled]="saving()">
                <mat-icon>save</mat-icon> Save Progress
              </button>
              <div class="mrf-actions__right">
                <button mat-stroked-button color="warn" (click)="requestChanges()" [disabled]="saving()">
                  <mat-icon>undo</mat-icon> Request Changes
                </button>
                <button mat-flat-button color="primary" (click)="approve()" [disabled]="saving()">
                  @if (saving()) {
                    <span><mat-progress-spinner diameter="20" mode="indeterminate" /></span>
                  } @else {
                    <span><mat-icon>check_circle</mat-icon> Approve</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .mrf-loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }

    .mrf-container { max-width: 1200px; margin: 0 auto; }

    /* Employee Banner */
    .mrf-employee-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .mrf-employee-banner__avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: #2563eb; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .mrf-employee-banner__info { flex: 1; }
    .mrf-employee-banner__name {
      font-size: 18px; font-weight: 700; color: var(--color-text); margin: 0;
    }
    .mrf-employee-banner__meta {
      font-size: 13px; color: var(--color-text-muted); margin: 4px 0 0;
    }
    .mrf-employee-banner__date {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--color-text-muted);
    }
    .mrf-employee-banner__date mat-icon {
      font-size: 18px !important; width: 18px !important; height: 18px !important;
    }

    /* Grid layout */
    .mrf-grid {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 980px) {
      .mrf-grid { grid-template-columns: 1fr; }
    }

    /* Employee Sections (left) */
    .mrf-sections-title, .mrf-review-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; font-weight: 700; color: var(--color-text);
      margin: 0 0 14px;
    }
    .mrf-sections-title mat-icon, .mrf-review-title mat-icon {
      font-size: 20px !important; width: 20px !important; height: 20px !important;
      color: #2563eb;
    }

    .mrf-panel-title { font-weight: 600; font-size: 14px; }

    .mrf-questions { display: flex; flex-direction: column; gap: 14px; padding: 4px; }
    .mrf-question {
      padding: 14px;
      background: var(--color-bg);
      border-radius: 10px;
      border: 1px solid var(--color-border);
    }
    .mrf-question__header { display: flex; gap: 8px; margin-bottom: 10px; }
    .mrf-question__num {
      font-size: 11px; font-weight: 700; color: var(--color-text-disabled);
      flex-shrink: 0; margin-top: 2px;
    }
    .mrf-question__text { display: flex; flex-direction: column; gap: 2px; }
    .mrf-question__label { font-size: 13px; font-weight: 600; color: var(--color-text); }
    .mrf-question__desc { font-size: 12px; color: var(--color-text-muted); }

    .mrf-question__answer {
      padding: 10px 12px;
      background: var(--color-surface);
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }
    .mrf-question__answer-label {
      font-size: 11px; font-weight: 600; color: var(--color-text-disabled);
      display: block; margin-bottom: 4px;
    }
    .mrf-question__answer-value {
      font-size: 13px; color: var(--color-text);
      white-space: pre-wrap; word-break: break-word;
    }

    /* Manager Review (right) */
    .mrf-review {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      position: sticky;
      top: 80px;
    }
    .mrf-review-hint {
      font-size: 13px; color: var(--color-text-muted); margin: 0 0 20px;
    }

    .mrf-review-questions { display: flex; flex-direction: column; gap: 18px; }
    .mrf-review-section__title {
      font-size: 13px; font-weight: 700; color: var(--color-text);
      margin: 0 0 10px; padding-bottom: 6px;
      border-bottom: 1px solid var(--color-border);
    }
    .mrf-rate-block { margin-bottom: 16px; }
    .mrf-rate-label {
      display: block; font-size: 13px; font-weight: 600; color: var(--color-text);
      margin-bottom: 8px;
    }
    .mrf-rate-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .mrf-rate-pill {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      padding: 4px 10px;
      border: 1px solid var(--color-border); border-radius: 8px;
      cursor: pointer; transition: all 180ms ease;
    }
    .mrf-rate-pill:hover { border-color: #2563eb; }
    .mrf-rate-pill span { font-size: 11px; color: var(--color-text-muted); }
    .mrf-rate-comment { width: 100%; margin-top: 6px; }

    .mrf-overall { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--color-border); }
    .mrf-overall__label {
      display: block; font-size: 14px; font-weight: 600; color: var(--color-text);
      margin-bottom: 8px;
    }
    .mrf-overall__field { width: 100%; }

    .mrf-actions {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 20px; padding-top: 16px;
      border-top: 1px solid var(--color-border);
    }
    .mrf-actions__right { display: flex; gap: 10px; }
    @media (max-width: 640px) {
      .mrf-actions { flex-direction: column; gap: 12px; }
      .mrf-actions__right { width: 100%; justify-content: flex-end; }
      .mrf-review { position: static; }
    }
  `],
})
export class ManagerReviewFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private evalService = inject(EvaluationService);
  private reviewService = inject(ManagerReviewService);
  private employeeService = inject(EmployeeService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  evaluation = signal<EmployeeEvaluation | null>(null);
  sections = signal<EvaluationSection[]>([]);
  loading = signal(false);
  saving = signal(false);
  managerReview = signal<ManagerReview | null>(null);
  managerId = signal<string | null>(null);

  form: FormGroup = this.fb.group({});

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Team Reviews", url: "/app/team-reviews" },
    { label: "Review" },
  ];

  employeeName = signal("");

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id")!;
    await this.load(id);
  }

  async load(id: string) {
    this.loading.set(true);
    try {
      const user = this.auth.user();
      if (user) {
        const mgr = await this.employeeService.getByUserId(user.id);
        this.managerId.set(mgr?.id ?? null);
      }

      const data = await this.evalService.getById(id);
      if (!data) {
        this.toast.error("Evaluation not found");
        this.router.navigate(["/app/team-reviews"]);
        return;
      }
      this.evaluation.set(data);
      this.employeeName.set(`${data.employee?.first_name} ${data.employee?.last_name}`);

      const sortedSections = (data.template?.sections ?? []).sort(
        (a, b) => a.display_order - b.display_order
      );
      sortedSections.forEach((s) =>
        (s.questions ?? []).sort((a, b) => a.display_order - b.display_order)
      );
      this.sections.set(sortedSections);

      const existingReview = await this.reviewService.getByEvaluationId(id);
      this.managerReview.set(existingReview);

      if (!existingReview) {
        const mgrId = this.managerId();
        if (mgrId) {
          const review = await this.reviewService.create({
            evaluation_id: id,
            manager_id: mgrId,
            status: "in_review",
            is_active: true,
          } as any);
          this.managerReview.set(review);
        }
      }

      this.buildForm();
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  private buildForm() {
    const group: Record<string, any> = {};
    const existingRatings = new Map(
      (this.managerReview()?.ratings ?? []).map((r) => [r.question_id, r])
    );

    for (const section of this.sections()) {
      for (const q of section.questions ?? []) {
        const existing = existingRatings.get(q.id);
        if (q.question_type === "rating") {
          group[q.id] = [existing?.rating_value ?? null];
        }
        group[q.id + "_comment"] = [existing?.comment ?? ""];
      }
    }
    group["_overall_comment"] = [this.managerReview()?.overall_comment ?? ""];
    this.form = this.fb.group(group);
  }

  getRatingRange(q: any): number[] {
    const min = q.min_rating ?? 1;
    const max = q.max_rating ?? 5;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  getEmployeeAnswer(q: any): string {
    const rating = (this.evaluation()?.ratings ?? []).find((r) => r.question_id === q.id);
    if (!rating) return "No response";
    if (q.question_type === "rating") return `${rating.rating_value} / 5`;
    if (q.question_type === "text" || q.question_type === "textarea") return rating.text_value || "No response";
    if (q.question_type === "dropdown" || q.question_type === "checkbox") {
      return rating.selected_options?.join(", ") || "No selection";
    }
    if (q.question_type === "date") return rating.date_value || "No date selected";
    return "No response";
  }

  private collectRatings() {
    const ratings: any[] = [];
    for (const section of this.sections()) {
      for (const q of section.questions ?? []) {
        const rating: any = { question_id: q.id };
        if (q.question_type === "rating") {
          rating.rating_value = this.form.value[q.id] ?? null;
        }
        rating.comment = this.form.value[q.id + "_comment"] ?? null;
        ratings.push(rating);
      }
    }
    return ratings;
  }

  async saveProgress() {
    this.saving.set(true);
    try {
      const review = this.managerReview();
      if (!review) return;
      await this.reviewService.saveRatings(review.id, this.collectRatings());
      await this.reviewService.update(review.id, {
        overall_comment: this.form.value["_overall_comment"] ?? null,
      });
      this.toast.success("Progress saved");
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  async requestChanges() {
    this.saving.set(true);
    try {
      const review = this.managerReview();
      const evalId = this.evaluation()!.id;
      if (review) {
        await this.reviewService.saveRatings(review.id, this.collectRatings());
        await this.reviewService.update(review.id, {
          overall_comment: this.form.value["_overall_comment"] ?? null,
          status: "changes_requested",
        });
      }
      await this.evalService.updateStatus(evalId, "changes_requested");
      this.toast.success("Changes requested from employee");
      this.router.navigate(["/app/team-reviews"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  async approve() {
    this.saving.set(true);
    try {
      const review = this.managerReview();
      const evalId = this.evaluation()!.id;
      if (review) {
        await this.reviewService.saveRatings(review.id, this.collectRatings());
        await this.reviewService.update(review.id, {
          overall_comment: this.form.value["_overall_comment"] ?? null,
          status: "approved",
          reviewed_at: new Date().toISOString(),
        });
      }
      await this.evalService.updateStatus(evalId, "approved", {
        approved_at: new Date().toISOString(),
      });
      this.toast.success("Evaluation approved successfully");
      this.router.navigate(["/app/team-reviews"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }
}

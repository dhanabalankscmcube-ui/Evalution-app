import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatRadioModule } from "@angular/material/radio";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../shared/components/status-badge.component";
import { ToastService } from "../../core/services/toast.service";
import { EvaluationService } from "../../core/services/domain.services";
import type {
  EmployeeEvaluation,
  EvaluationSection,
  EvaluationQuestion,
  EmployeeRating,
} from "../../core/models";

@Component({
  selector: "app-evaluation-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
    MatExpansionModule, MatRadioModule, PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header [title]="isReadOnly() ? 'View Evaluation' : 'Edit Evaluation'"
      [subtitle]="evaluation()?.review_period?.name ?? ''" [breadcrumbs]="breadcrumbs">
      @if (evaluation()) {
        <app-status-badge [status]="evaluation()!.status" />
      }
    </app-page-header>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (evaluation()) {
      <div class="space-y-4">
        @for (section of sections(); track section.id; let si = $index) {
          <mat-expansion-panel [expanded]="true" class="shadow-sm">
            <mat-expansion-panel-header>
              <mat-panel-title class="font-semibold text-slate-900">
                {{ si + 1 }}. {{ section.title }}
              </mat-panel-title>
              <mat-panel-description>
                {{ section.questions?.length ?? 0 }} question(s)
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="p-4 space-y-5">
              @if (section.description) {
                <p class="text-sm text-slate-500">{{ section.description }}</p>
              }

              @for (q of section.questions; track q.id; let qi = $index) {
                <div class="q-block">
                  <div class="q-block__header">
                    <span class="q-block__num">Q{{ qi + 1 }}</span>
                    <div class="q-block__text">
                      <label class="q-block__label">
                        {{ q.text }}
                        @if (q.is_required) {
                          <span class="q-block__req">*</span>
                        }
                      </label>
                      @if (q.description) {
                        <p class="q-block__desc">{{ q.description }}</p>
                      }
                    </div>
                  </div>

                  <!-- Rating with conditional improvement textbox -->
                  @if (q.question_type === 'rating') {
                    <div [formGroup]="form">
                      <div class="rating-row">
                        @for (r of getRatingRange(q); track r) {
                          <label class="rating-card" [class.rating-card--low]="r <= 2"
                            [class.rating-card--mid]="r === 3"
                            [class.rating-card--high]="r >= 4">
                            <input type="radio" [formControlName]="q.id" [value]="r"
                              [disabled]="isReadOnly()" [id]="q.id + '_' + r" />
                            <span class="rating-card__num">{{ r }}</span>
                          </label>
                        }
                      </div>
                      <div class="rating-labels">
                        @for (label of getRatingLabels(q); track $index) {
                          <span>{{ label }}</span>
                        }
                      </div>

                      @if (q.min_rating && q.max_rating) {
                        <div class="rating-scale-hint">
                          <span>{{ getRatingLabel(q.min_rating) }}</span>
                          <span>{{ getRatingLabel(q.max_rating) }}</span>
                        </div>
                      }

                      @if (showImprovementBox(q)) {
                        <div class="improvement-box">
                          <div class="improvement-box__header">
                            <mat-icon>tips_and_updates</mat-icon>
                            <span>Improvement Plan Required</span>
                          </div>
                          <p class="improvement-box__desc">
                            Your rating is below 3. Please describe how you plan to improve in this area.
                          </p>
                          <mat-form-field appearance="outline" class="w-full">
                            <textarea matInput [formControlName]="q.id + '_improvement'"
                              [readonly]="isReadOnly()" rows="3"
                              placeholder="Describe specific actions you'll take to improve..."></textarea>
                          </mat-form-field>
                        </div>
                      }
                    </div>
                  }

                  <!-- Text -->
                  @if (q.question_type === 'text') {
                    <div [formGroup]="form">
                      <mat-form-field appearance="outline" class="w-full">
                        <input matInput [formControlName]="q.id" [readonly]="isReadOnly()"
                          placeholder="Enter your answer…" />
                      </mat-form-field>
                    </div>
                  }

                  <!-- Textarea -->
                  @if (q.question_type === 'textarea') {
                    <div [formGroup]="form">
                      <mat-form-field appearance="outline" class="w-full">
                        <textarea matInput [formControlName]="q.id" [readonly]="isReadOnly()"
                          rows="4" placeholder="Enter your answer…"></textarea>
                      </mat-form-field>
                    </div>
                  }

                  <!-- Dropdown -->
                  @if (q.question_type === 'dropdown') {
                    <div [formGroup]="form">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Select an option</mat-label>
                        <select matNativeControl [formControlName]="q.id" [disabled]="isReadOnly()">
                          <option value="">— Select —</option>
                          @for (opt of q.options; track opt) {
                            <option [value]="opt">{{ opt }}</option>
                          }
                        </select>
                      </mat-form-field>
                    </div>
                  }

                  <!-- Checkbox — modern custom cards -->
                  @if (q.question_type === 'checkbox') {
                    <div [formGroup]="form" class="checkbox-grid">
                      @for (opt of q.options; track opt) {
                        <label class="check-card" [class.check-card--checked]="isChecked(q.id, opt)">
                          <mat-checkbox [formControlName]="q.id + '_' + sanitize(opt)"
                            [disabled]="isReadOnly()"
                            (change)="onCheckboxChange(q.id, opt, $event.checked)">
                          </mat-checkbox>
                          <span class="check-card__label">{{ opt }}</span>
                        </label>
                      }
                    </div>
                  }

                  <!-- Date -->
                  @if (q.question_type === 'date') {
                    <div [formGroup]="form">
                      <mat-form-field appearance="outline" class="w-full max-w-xs">
                        <mat-label>Select date</mat-label>
                        <input matInput [matDatepicker]="picker" [formControlName]="q.id"
                          [disabled]="isReadOnly()" />
                        <mat-datepicker-toggle matSuffix [for]="picker" />
                        <mat-datepicker #picker />
                      </mat-form-field>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-expansion-panel>
        }

        <!-- Overall Comment -->
        <div class="overall-section">
          <h3 class="overall-section__title">Overall Comments</h3>
          <div [formGroup]="form">
            <mat-form-field appearance="outline" class="w-full">
              <textarea matInput formControlName="_overall_comment" [readonly]="isReadOnly()"
                rows="4" placeholder="Add any overall comments about your performance this period…"></textarea>
            </mat-form-field>
          </div>
        </div>

        <!-- Actions -->
        @if (!isReadOnly()) {
          <div class="action-bar">
            <button mat-stroked-button (click)="saveDraft()" [disabled]="saving()">
              <mat-icon>save</mat-icon> Save Draft
            </button>
            <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
              @if (saving()) {
                <span><mat-progress-spinner diameter="20" mode="indeterminate" /></span>
              } @else {
                <span><mat-icon>send</mat-icon> Submit Evaluation</span>
              }
            </button>
          </div>
        }

        @if (isReadOnly()) {
          <div class="action-bar">
            <button mat-stroked-button (click)="back()">Back</button>
            @if (evaluation()?.status === 'changes_requested') {
              <button mat-flat-button color="primary" (click)="resubmit()">
                <mat-icon>edit</mat-icon> Edit &amp; Resubmit
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .q-block {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .q-block__header { display: flex; gap: 10px; margin-bottom: 12px; }
    .q-block__num {
      font-size: 11px; font-weight: 700; color: var(--color-text-disabled);
      flex-shrink: 0; margin-top: 2px;
      background: var(--color-surface); border: 1px solid var(--color-border);
      padding: 2px 8px; border-radius: 6px;
    }
    .q-block__text { flex: 1; }
    .q-block__label {
      font-size: 14px; font-weight: 600; color: var(--color-text); display: block;
    }
    .q-block__req { color: #ef4444; margin-left: 2px; }
    .q-block__desc {
      font-size: 12px; color: var(--color-text-muted); margin: 4px 0 0;
    }

    /* Rating cards */
    .rating-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .rating-card {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 48px; height: 48px;
      border: 2px solid var(--color-border); border-radius: 10px;
      cursor: pointer; transition: all 180ms ease;
      background: var(--color-surface);
      position: relative;
    }
    .rating-card input[type="radio"] {
      position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; margin: 0;
    }
    .rating-card__num {
      font-size: 16px; font-weight: 700; color: var(--color-text-muted);
      pointer-events: none;
    }
    .rating-card:hover { border-color: var(--color-primary); transform: translateY(-1px); }
    .rating-card--low:hover { border-color: #ef4444; }
    .rating-card--mid:hover { border-color: #f59e0b; }
    .rating-card--high:hover { border-color: #22c55e; }

    .rating-card:has(input:checked) {
      border-color: var(--color-primary);
      background: var(--color-primary);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .rating-card:has(input:checked) .rating-card__num { color: #fff; }
    .rating-card--low:has(input:checked) {
      border-color: #ef4444; background: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
    }
    .rating-card--mid:has(input:checked) {
      border-color: #f59e0b; background: #f59e0b;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    }
    .rating-card--high:has(input:checked) {
      border-color: #22c55e; background: #22c55e;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
    }

    .rating-labels {
      display: flex; gap: 8px; margin-top: 6px; padding: 0 2px;
    }
    .rating-labels span {
      font-size: 11px; color: var(--color-text-disabled);
      width: 48px; text-align: center;
    }
    .rating-scale-hint {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--color-text-disabled);
      margin-top: 4px; padding: 0 2px;
    }

    /* Improvement box */
    .improvement-box {
      margin-top: 12px;
      padding: 16px;
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-left: 4px solid #f59e0b;
      border-radius: 10px;
      animation: slideDown 250ms ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .improvement-box__header {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600; color: #92400e;
      margin-bottom: 6px;
    }
    .improvement-box__header mat-icon {
      font-size: 18px !important; width: 18px !important; height: 18px !important; color: #f59e0b;
    }
    .improvement-box__desc {
      font-size: 12px; color: #78350f; margin: 0 0 10px;
    }

    /* Checkbox grid */
    .checkbox-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    .check-card {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      border: 1.5px solid var(--color-border); border-radius: 10px;
      cursor: pointer; transition: all 180ms ease;
      background: var(--color-surface);
    }
    .check-card:hover { border-color: var(--color-primary); }
    .check-card--checked {
      border-color: var(--color-primary);
      background: rgba(37, 99, 235, 0.05);
    }
    .check-card__label {
      font-size: 14px; font-weight: 500; color: var(--color-text);
    }

    .overall-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px; padding: 20px;
    }
    .overall-section__title {
      font-size: 16px; font-weight: 700; color: var(--color-text); margin: 0 0 12px;
    }

    .action-bar {
      display: flex; align-items: center; justify-content: flex-end; gap: 12px;
      position: sticky; bottom: 16px;
      background: var(--color-surface);
      backdrop-filter: blur(8px);
      padding: 16px 20px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    @media (max-width: 640px) {
      .checkbox-grid { grid-template-columns: 1fr; }
      .action-bar { flex-direction: column-reverse; }
      .action-bar button { width: 100%; }
    }
  `],
})
export class EvaluationFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private evalService = inject(EvaluationService);
  private toast = inject(ToastService);

  evaluation = signal<EmployeeEvaluation | null>(null);
  sections = signal<EvaluationSection[]>([]);
  loading = signal(false);
  saving = signal(false);
  checkboxState = signal<Record<string, string[]>>({});

  form: FormGroup = this.fb.group({});

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "My Evaluations", url: "/app/my-evaluations" },
    { label: "Evaluation" },
  ];

  isReadOnly = computed(() => {
    const status = this.evaluation()?.status;
    return status !== "draft" && status !== "changes_requested";
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id")!;
    await this.load(id);
  }

  async load(id: string) {
    this.loading.set(true);
    try {
      const data = await this.evalService.getById(id);
      if (!data) {
        this.toast.error("Evaluation not found");
        this.router.navigate(["/app/my-evaluations"]);
        return;
      }
      this.evaluation.set(data);
      this.breadcrumbs.push({ label: data.review_period?.name ?? "Evaluation" });

      const sortedSections = (data.template?.sections ?? []).sort(
        (a, b) => a.display_order - b.display_order
      );
      sortedSections.forEach((s) =>
        (s.questions ?? []).sort((a, b) => a.display_order - b.display_order)
      );
      this.sections.set(sortedSections);

      this.buildForm(data);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  private buildForm(evalData: EmployeeEvaluation) {
    const group: Record<string, any> = {};
    const existingRatings = new Map(
      (evalData.ratings ?? []).map((r) => [r.question_id, r])
    );

    const cbState: Record<string, string[]> = {};

    for (const section of this.sections()) {
      for (const q of section.questions ?? []) {
        const existing = existingRatings.get(q.id);

        if (q.question_type === "checkbox") {
          const checked = existing?.selected_options ?? [];
          cbState[q.id] = [...checked];
          for (const opt of q.options ?? []) {
            const key = q.id + "_" + this.sanitize(opt);
            group[key] = [checked.includes(opt)];
          }
        } else if (q.question_type === "rating") {
          group[q.id] = [existing?.rating_value ?? null];
          group[q.id + "_improvement"] = [""];
        } else if (q.question_type === "text" || q.question_type === "textarea") {
          group[q.id] = [existing?.text_value ?? ""];
        } else if (q.question_type === "dropdown") {
          group[q.id] = [existing?.selected_options?.[0] ?? ""];
        } else if (q.question_type === "date") {
          group[q.id] = [existing?.date_value ?? ""];
        }
      }
    }

    group["_overall_comment"] = [evalData.employee_comment ?? ""];
    this.form = this.fb.group(group);
    this.checkboxState.set(cbState);
  }

  getRatingRange(q: EvaluationQuestion): number[] {
    const min = q.min_rating ?? 1;
    const max = q.max_rating ?? 5;
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  getRatingLabels(q: EvaluationQuestion): string[] {
    const min = q.min_rating ?? 1;
    const max = q.max_rating ?? 5;
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const labelMap: Record<number, string> = {
      1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent",
    };
    return range.map((r) => labelMap[r] ?? "");
  }

  getRatingLabel(value: number): string {
    const labels: Record<number, string> = {
      1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent",
    };
    return labels[value] ?? "";
  }

  sanitize(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, "_");
  }

  showImprovementBox(q: EvaluationQuestion): boolean {
    const val = this.form.value[q.id];
    return val !== null && val !== undefined && val < 3;
  }

  isChecked(qid: string, opt: string): boolean {
    return this.checkboxState()[qid]?.includes(opt) ?? false;
  }

  onCheckboxChange(qid: string, opt: string, checked: boolean) {
    this.checkboxState.update((state) => {
      const current = state[qid] ?? [];
      return {
        ...state,
        [qid]: checked ? [...current, opt] : current.filter((o) => o !== opt),
      };
    });
  }

  private collectRatings(): Partial<EmployeeRating>[] {
    const ratings: Partial<EmployeeRating>[] = [];

    for (const section of this.sections()) {
      for (const q of section.questions ?? []) {
        const rating: Partial<EmployeeRating> = { question_id: q.id };

        if (q.question_type === "rating") {
          rating.rating_value = this.form.value[q.id] ?? null;
          const improvement = this.form.value[q.id + "_improvement"];
          if (improvement) {
            rating.comment = improvement;
          }
        } else if (q.question_type === "text" || q.question_type === "textarea") {
          rating.text_value = this.form.value[q.id] ?? null;
        } else if (q.question_type === "dropdown") {
          rating.selected_options = this.form.value[q.id] ? [this.form.value[q.id]] : null;
        } else if (q.question_type === "checkbox") {
          const selected = this.checkboxState()[q.id] ?? [];
          rating.selected_options = selected.length > 0 ? selected : null;
        } else if (q.question_type === "date") {
          const val = this.form.value[q.id];
          rating.date_value = val ? (typeof val === "string" ? val : val.toISOString().split("T")[0]) : null;
        }

        ratings.push(rating);
      }
    }

    return ratings;
  }

  private validateRatings(ratings: Partial<EmployeeRating>[]): string | null {
    for (const section of this.sections()) {
      for (const q of section.questions ?? []) {
        if (!q.is_required) continue;
        const r = ratings.find((x) => x.question_id === q.id);
        if (!r) continue;

        if (q.question_type === "rating" && (r.rating_value === null || r.rating_value === undefined)) {
          return `Question "${q.text}" requires a rating.`;
        }
        if (q.question_type === "rating" && r.rating_value !== null && r.rating_value !== undefined && r.rating_value < 3) {
          const improvement = this.form.value[q.id + "_improvement"];
          if (!improvement || !improvement.trim()) {
            return `Question "${q.text}" was rated below 3. Please provide an improvement plan.`;
          }
        }
        if ((q.question_type === "text" || q.question_type === "textarea") && !r.text_value) {
          return `Question "${q.text}" is required.`;
        }
        if (q.question_type === "dropdown" && (!r.selected_options || r.selected_options.length === 0)) {
          return `Question "${q.text}" requires a selection.`;
        }
        if (q.question_type === "checkbox" && (!r.selected_options || r.selected_options.length === 0)) {
          return `Question "${q.text}" requires at least one option.`;
        }
        if (q.question_type === "date" && !r.date_value) {
          return `Question "${q.text}" requires a date.`;
        }
      }
    }
    return null;
  }

  async saveDraft(): Promise<void> {
    this.saving.set(true);
    try {
      const ratings = this.collectRatings();
      await this.evalService.saveRatings(this.evaluation()!.id, ratings);
      await this.evalService.updateComment(this.evaluation()!.id, this.form.value["_overall_comment"] ?? "");
      this.toast.success("Draft saved");
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  async submit(): Promise<void> {
    const ratings = this.collectRatings();
    const error = this.validateRatings(ratings);
    if (error) {
      this.toast.error(error);
      return;
    }

    this.saving.set(true);
    try {
      await this.evalService.saveRatings(this.evaluation()!.id, ratings);
      await this.evalService.updateComment(this.evaluation()!.id, this.form.value["_overall_comment"] ?? "");
      await this.evalService.updateStatus(this.evaluation()!.id, "submitted", {
        submitted_at: new Date().toISOString(),
      });
      this.toast.success("Evaluation submitted");
      this.router.navigate(["/app/my-evaluations"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  async resubmit(): Promise<void> {
    this.router.navigate(["/app/my-evaluations", this.evaluation()!.id, "edit"]);
  }

  back(): void {
    this.router.navigate(["/app/my-evaluations"]);
  }
}

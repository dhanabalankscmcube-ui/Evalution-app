import { Component, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PageHeaderComponent } from "../../shared/components/page-header.component";

interface RatingQuestion {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

interface TextQuestion {
  id: string;
  label: string;
  placeholder?: string;
  maxLen: number;
  required: boolean;
}

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: "app-start-evaluation",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatRadioModule, MatCheckboxModule,
    MatSelectModule, MatProgressBarModule, MatTooltipModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Start Self-Evaluation"
      subtitle="Q2 2026 Performance Review — Progressive Form"
      [breadcrumbs]="breadcrumbs"
    />

    <div class="eval-wizard">
      <!-- Stepper Header -->
      <div class="stepper">
        @for (step of steps; track step.id; let i = $index) {
          <div
            class="step"
            [class.step--active]="currentStep() === i"
            [class.step--done]="currentStep() > i"
            (click)="goToStep(i)"
          >
            <div class="step__icon">
              @if (currentStep() > i) {
                <mat-icon>check</mat-icon>
              } @else {
                <mat-icon>{{ step.icon }}</mat-icon>
              }
            </div>
            <div class="step__info">
              <span class="step__label">Step {{ i + 1 }}</span>
              <span class="step__title">{{ step.title }}</span>
            </div>
          </div>
          @if (!$last) {
            <div class="step__connector" [class.step__connector--done]="currentStep() > i"></div>
          }
        }
      </div>

      <!-- Progress Bar -->
      <mat-progress-bar mode="determinate" [value]="progressPercent()" class="eval-progress" />

      <!-- Step Content -->
      <div class="eval-card" [formGroup]="form">
        <!-- STEP 1: Company Questions -->
        @if (currentStep() === 0) {
          <div class="step-content">
            <h2 class="step-content__title">Company & Role Questions</h2>
            <p class="step-content__desc">Tell us about your experience with the company and your role this quarter.</p>

            <div class="question-block">
              <label class="question-label">
                How well do you understand the company's mission and values?
                <span class="req">*</span>
              </label>
              <mat-radio-group formControlName="company_mission" class="rating-row">
                @for (r of [1,2,3,4,5]; track r) {
                  <label class="rating-pill">
                    <mat-radio-button [value]="r" />
                    <span>{{ r }}</span>
                  </label>
                }
              </mat-radio-group>
              <div class="rating-labels">
                <span>Poor</span><span>Excellent</span>
              </div>
            </div>

            <div class="question-block">
              <label class="question-label">
                How would you rate the company culture and work environment?
                <span class="req">*</span>
              </label>
              <mat-radio-group formControlName="company_culture" class="rating-row">
                @for (r of [1,2,3,4,5]; track r) {
                  <label class="rating-pill">
                    <mat-radio-button [value]="r" />
                    <span>{{ r }}</span>
                  </label>
                }
              </mat-radio-group>
              <div class="rating-labels">
                <span>Poor</span><span>Excellent</span>
              </div>
            </div>

            <div class="question-block">
              <label class="question-label">
                Do you feel your role aligns with your career aspirations?
                <span class="req">*</span>
              </label>
              <mat-radio-group formControlName="role_alignment" class="rating-row">
                @for (r of [1,2,3,4,5]; track r) {
                  <label class="rating-pill">
                    <mat-radio-button [value]="r" />
                    <span>{{ r }}</span>
                  </label>
                }
              </mat-radio-group>
              <div class="rating-labels">
                <span>Not at all</span><span>Perfectly aligned</span>
              </div>
            </div>

            <div class="question-block">
              <label class="question-label">
                How effective is the communication from leadership?
                <span class="req">*</span>
              </label>
              <mat-radio-group formControlName="leadership_comm" class="rating-row">
                @for (r of [1,2,3,4,5]; track r) {
                  <label class="rating-pill">
                    <mat-radio-button [value]="r" />
                    <span>{{ r }}</span>
                  </label>
                }
              </mat-radio-group>
              <div class="rating-labels">
                <span>Poor</span><span>Excellent</span>
              </div>
            </div>

            <div class="question-block">
              <label class="question-label">
                What improvements would you suggest for the company?
                <span class="req">*</span>
              </label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput formControlName="company_improvements" rows="4"
                  placeholder="Share your suggestions for workplace improvement..."></textarea>
              </mat-form-field>
            </div>
          </div>
        }

        <!-- STEP 2: Self-Assessment -->
        @if (currentStep() === 1) {
          <div class="step-content">
            <h2 class="step-content__title">Self-Assessment</h2>
            <p class="step-content__desc">Rate your own performance across key competencies this quarter.</p>

            @for (q of selfRatingQuestions; track q.id) {
              <div class="question-block">
                <label class="question-label">
                  {{ q.label }}
                  @if (q.required) { <span class="req">*</span> }
                </label>
                @if (q.description) {
                  <p class="question-hint">{{ q.description }}</p>
                }
                <mat-radio-group [formControlName]="q.id" class="rating-row">
                  @for (r of [1,2,3,4,5]; track r) {
                    <label class="rating-pill">
                      <mat-radio-button [value]="r" />
                      <span>{{ r }}</span>
                    </label>
                  }
                </mat-radio-group>
                <div class="rating-labels">
                  <span>Needs Improvement</span><span>Exceeds Expectations</span>
                </div>
              </div>
            }

            <div class="question-block">
              <label class="question-label">
                What were your biggest accomplishments this quarter?
                <span class="req">*</span>
              </label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput formControlName="accomplishments" rows="4"
                  placeholder="Describe your key achievements and wins..."></textarea>
              </mat-form-field>
            </div>

            <div class="question-block">
              <label class="question-label">
                What areas do you feel need improvement?
                <span class="req">*</span>
              </label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput formControlName="improvement_areas" rows="4"
                  placeholder="Be honest about areas you want to grow in..."></textarea>
              </mat-form-field>
            </div>
          </div>
        }

        <!-- STEP 3: Goals -->
        @if (currentStep() === 2) {
          <div class="step-content">
            <h2 class="step-content__title">Goals & Development</h2>
            <p class="step-content__desc">Set your goals for the upcoming quarter and reflect on previous goals.</p>

            <div class="question-block">
              <label class="question-label">
                Did you achieve your goals from the previous quarter?
                <span class="req">*</span>
              </label>
              <mat-radio-group formControlName="prev_goals_met" class="choice-row">
                <mat-radio-button [value]="'fully'">Fully achieved</mat-radio-button>
                <mat-radio-button [value]="'partially'">Partially achieved</mat-radio-button>
                <mat-radio-button [value]="'not_met'">Not achieved</mat-radio-button>
              </mat-radio-group>
            </div>

            <div class="question-block">
              <label class="question-label">
                If partially or not achieved, what were the barriers?
              </label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput formControlName="goal_barriers" rows="3"
                  placeholder="Explain any obstacles that prevented goal completion..."></textarea>
              </mat-form-field>
            </div>

            <div class="question-block">
              <label class="question-label">
                Set 3 goals for the upcoming quarter
                <span class="req">*</span>
              </label>
              <p class="question-hint">Use SMART criteria — Specific, Measurable, Achievable, Relevant, Time-bound.</p>

              <div class="goal-inputs">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Goal 1</mat-label>
                  <input matInput formControlName="goal_1" placeholder="e.g. Complete project X by end of Q3" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Goal 2</mat-label>
                  <input matInput formControlName="goal_2" placeholder="e.g. Improve team collaboration score by 15%" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Goal 3</mat-label>
                  <input matInput formControlName="goal_3" placeholder="e.g. Obtain AWS certification by October" />
                </mat-form-field>
              </div>
            </div>

            <div class="question-block">
              <label class="question-label">
                What learning and development support do you need?
              </label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-select formControlName="development_needs" multiple>
                  <mat-option value="training">Training courses</mat-option>
                  <mat-option value="mentorship">Mentorship program</mat-option>
                  <mat-option value="conference">Conference attendance</mat-option>
                  <mat-option value="certification">Certification support</mat-option>
                  <mat-option value="coaching">Executive coaching</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        }

        <!-- STEP 4: Review & Submit -->
        @if (currentStep() === 3) {
          <div class="step-content">
            <h2 class="step-content__title">Review &amp; Submit</h2>
            <p class="step-content__desc">Please review your responses before submitting.</p>

            <div class="review-summary">
              <div class="review-section">
                <h3 class="review-section__title">
                  <mat-icon>business</mat-icon>
                  Company & Role
                </h3>
                <div class="review-row">
                  <span>Company mission understanding</span>
                  <span class="review-value">{{ displayRating('company_mission') }}</span>
                </div>
                <div class="review-row">
                  <span>Company culture rating</span>
                  <span class="review-value">{{ displayRating('company_culture') }}</span>
                </div>
                <div class="review-row">
                  <span>Role alignment</span>
                  <span class="review-value">{{ displayRating('role_alignment') }}</span>
                </div>
                <div class="review-row">
                  <span>Leadership communication</span>
                  <span class="review-value">{{ displayRating('leadership_comm') }}</span>
                </div>
              </div>

              <div class="review-section">
                <h3 class="review-section__title">
                  <mat-icon>self_improvement</mat-icon>
                  Self-Assessment
                </h3>
                @for (q of selfRatingQuestions; track q.id) {
                  <div class="review-row">
                    <span>{{ q.label }}</span>
                    <span class="review-value">{{ displayRating(q.id) }}</span>
                  </div>
                }
              </div>

              <div class="review-section">
                <h3 class="review-section__title">
                  <mat-icon>flag</mat-icon>
                  Goals & Development
                </h3>
                <div class="review-row">
                  <span>Previous goals status</span>
                  <span class="review-value">{{ displayChoice('prev_goals_met') }}</span>
                </div>
                <div class="review-row">
                  <span>Goal 1</span>
                  <span class="review-value review-value--text">{{ form.value.goal_1 || '—' }}</span>
                </div>
                <div class="review-row">
                  <span>Goal 2</span>
                  <span class="review-value review-value--text">{{ form.value.goal_2 || '—' }}</span>
                </div>
                <div class="review-row">
                  <span>Goal 3</span>
                  <span class="review-value review-value--text">{{ form.value.goal_3 || '—' }}</span>
                </div>
              </div>
            </div>

            <div class="question-block">
              <label class="question-label">
                Overall comments (optional)
              </label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput formControlName="overall_comment" rows="3"
                  placeholder="Any additional comments you'd like to share with your manager..."></textarea>
              </mat-form-field>
            </div>

            <div class="acknowledgment">
              <mat-checkbox formControlName="acknowledgment">
                I confirm that the information provided is accurate and reflects my self-assessment for Q2 2026.
              </mat-checkbox>
            </div>
          </div>
        }
      </div>

      <!-- Navigation -->
      <div class="eval-nav">
        <button mat-stroked-button (click)="cancel()" class="eval-nav__cancel">
          <mat-icon>close</mat-icon> Cancel
        </button>
        <div class="eval-nav__right">
          <span class="eval-nav__step">{{ currentStep() + 1 }} of {{ steps.length }}</span>
          <button mat-stroked-button (click)="prevStep()" [disabled]="currentStep() === 0">
            <mat-icon>arrow_back</mat-icon> Back
          </button>
          @if (currentStep() < steps.length - 1) {
            <button mat-flat-button color="primary" (click)="nextStep()">
              Next <mat-icon>arrow_forward</mat-icon>
            </button>
          } @else {
            <button mat-flat-button color="primary" (click)="submit()"
              [disabled]="!form.get('acknowledgment')?.value">
              <mat-icon>send</mat-icon> Submit Evaluation
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .eval-wizard {
      max-width: 880px;
      margin: 0 auto;
    }

    /* Stepper */
    .stepper {
      display: flex;
      align-items: center;
      gap: 0;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      flex-shrink: 0;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background 200ms ease;
    }
    .step:hover { background: rgba(37, 99, 235, 0.06); }
    .step__icon {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      background: var(--color-bg);
      border: 2px solid var(--color-border);
      color: var(--color-text-muted);
      transition: all 200ms ease;
    }
    .step__icon mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }
    .step--active .step__icon {
      background: #2563eb; border-color: #2563eb; color: #fff;
    }
    .step--done .step__icon {
      background: #22c55e; border-color: #22c55e; color: #fff;
    }
    .step__info { display: flex; flex-direction: column; line-height: 1.3; }
    .step__label { font-size: 11px; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .step__title { font-size: 14px; color: var(--color-text); font-weight: 600; white-space: nowrap; }
    .step__connector {
      flex: 1; height: 2px; min-width: 24px;
      background: var(--color-border);
      transition: background 200ms ease;
    }
    .step__connector--done { background: #22c55e; }

    .eval-progress {
      margin-bottom: 20px;
      border-radius: 4px;
      height: 6px;
    }

    /* Card */
    .eval-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 32px;
      min-height: 420px;
    }

    .step-content__title {
      font-size: 22px; font-weight: 700; color: var(--color-text);
      margin: 0 0 4px;
    }
    .step-content__desc {
      font-size: 14px; color: var(--color-text-muted); margin: 0 0 24px;
    }

    /* Questions */
    .question-block { margin-bottom: 28px; }
    .question-label {
      display: block; font-size: 14px; font-weight: 600;
      color: var(--color-text); margin-bottom: 10px;
    }
    .question-hint {
      font-size: 12px; color: var(--color-text-muted); margin: -4px 0 10px;
    }
    .req { color: #ef4444; margin-left: 2px; }
    .full-width { width: 100%; }

    /* Rating */
    .rating-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .rating-pill {
      display: flex; flex-direction: column; align-items: center;
      gap: 2px; padding: 6px 12px;
      border: 1px solid var(--color-border); border-radius: 8px;
      cursor: pointer; transition: all 180ms ease;
      background: var(--color-surface);
    }
    .rating-pill:hover { border-color: #2563eb; background: rgba(37, 99, 235, 0.04); }
    .rating-pill span { font-size: 12px; color: var(--color-text-muted); }
    .rating-labels {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--color-text-disabled);
      margin-top: 6px; padding: 0 4px;
    }

    .choice-row {
      display: flex; gap: 24px; flex-wrap: wrap;
      padding: 4px 0;
    }

    .goal-inputs { display: flex; flex-direction: column; gap: 4px; }

    /* Review Summary */
    .review-summary { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
    .review-section {
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 16px 20px;
      background: var(--color-bg);
    }
    .review-section__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: var(--color-text);
      margin: 0 0 12px;
    }
    .review-section__title mat-icon {
      font-size: 20px !important; width: 20px !important; height: 20px !important;
      color: #2563eb;
    }
    .review-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; font-size: 13px;
      border-bottom: 1px solid var(--color-border);
    }
    .review-row:last-child { border-bottom: none; }
    .review-row span:first-child { color: var(--color-text-muted); }
    .review-value {
      font-weight: 600; color: var(--color-text);
    }
    .review-value--text {
      max-width: 220px; text-align: right;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    .acknowledgment {
      padding: 16px 20px;
      background: rgba(37, 99, 235, 0.04);
      border: 1px solid rgba(37, 99, 235, 0.15);
      border-radius: 10px;
      margin-top: 8px;
    }

    /* Navigation */
    .eval-nav {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 20px; padding: 16px 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
    }
    .eval-nav__cancel { color: var(--color-text-muted) !important; }
    .eval-nav__right { display: flex; align-items: center; gap: 12px; }
    .eval-nav__step {
      font-size: 13px; font-weight: 600; color: var(--color-text-muted);
      margin-right: 4px;
    }

    @media (max-width: 640px) {
      .eval-card { padding: 20px 16px; }
      .step__info { display: none; }
      .eval-nav { flex-direction: column; gap: 12px; }
      .eval-nav__right { width: 100%; justify-content: flex-end; flex-wrap: wrap; }
      .choice-row { flex-direction: column; gap: 8px; }
    }
  `],
})
export class StartEvaluationComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentStep = signal(0);
  submitted = signal(false);

  breadcrumbs = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "My Evaluations", url: "/app/my-evaluations" },
    { label: "Start Evaluation", url: "/app/my-evaluations/new" },
  ];

  steps: Step[] = [
    { id: "company", title: "Company", subtitle: "Company & role questions", icon: "business" },
    { id: "self", title: "Self-Assessment", subtitle: "Rate your performance", icon: "self_improvement" },
    { id: "goals", title: "Goals", subtitle: "Set quarterly goals", icon: "flag" },
    { id: "review", title: "Review", subtitle: "Review & submit", icon: "task_alt" },
  ];

  selfRatingQuestions: RatingQuestion[] = [
    { id: "quality_of_work", label: "Quality of work", description: "Accuracy, thoroughness, and attention to detail.", required: true },
    { id: "productivity", label: "Productivity & efficiency", description: "Output volume and effective use of time.", required: true },
    { id: "teamwork", label: "Teamwork & collaboration", description: "Working effectively with others.", required: true },
    { id: "communication", label: "Communication skills", description: "Clarity in written and verbal communication.", required: true },
    { id: "initiative", label: "Initiative & proactivity", description: "Taking ownership and anticipating needs.", required: true },
    { id: "problem_solving", label: "Problem solving", description: "Analytical thinking and creative solutions.", required: true },
  ];

  progressPercent = computed(() => {
    return Math.round(((this.currentStep() + 1) / this.steps.length) * 100);
  });

  form: FormGroup = this.fb.group({
    // Step 1: Company
    company_mission: [null, Validators.required],
    company_culture: [null, Validators.required],
    role_alignment: [null, Validators.required],
    leadership_comm: [null, Validators.required],
    company_improvements: ["", Validators.required],
    // Step 2: Self-Assessment
    quality_of_work: [null, Validators.required],
    productivity: [null, Validators.required],
    teamwork: [null, Validators.required],
    communication: [null, Validators.required],
    initiative: [null, Validators.required],
    problem_solving: [null, Validators.required],
    accomplishments: ["", Validators.required],
    improvement_areas: ["", Validators.required],
    // Step 3: Goals
    prev_goals_met: [null, Validators.required],
    goal_barriers: [""],
    goal_1: ["", Validators.required],
    goal_2: ["", Validators.required],
    goal_3: ["", Validators.required],
    development_needs: [[]],
    // Step 4: Review
    overall_comment: [""],
    acknowledgment: [false, Validators.requiredTrue],
  });

  private stepFields: string[][] = [
    ["company_mission", "company_culture", "role_alignment", "leadership_comm", "company_improvements"],
    ["quality_of_work", "productivity", "teamwork", "communication", "initiative", "problem_solving", "accomplishments", "improvement_areas"],
    ["prev_goals_met", "goal_1", "goal_2", "goal_3"],
    ["acknowledgment"],
  ];

  goToStep(index: number): void {
    if (index <= this.currentStep()) {
      this.currentStep.set(index);
      return;
    }
    for (let i = 0; i < index; i++) {
      if (!this.isStepValid(i)) return;
    }
    this.currentStep.set(index);
  }

  nextStep(): void {
    if (!this.isStepValid(this.currentStep())) {
      this.markStepTouched(this.currentStep());
      return;
    }
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update((v) => v + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((v) => v - 1);
    }
  }

  private isStepValid(step: number): boolean {
    const fields = this.stepFields[step];
    return fields.every((f) => {
      const ctrl = this.form.get(f);
      return ctrl ? ctrl.valid : true;
    });
  }

  private markStepTouched(step: number): void {
    const fields = this.stepFields[step];
    fields.forEach((f) => this.form.get(f)?.markAsTouched());
  }

  displayRating(field: string): string {
    const val = this.form.value[field];
    if (val === null || val === undefined) return "—";
    const labels: Record<number, string> = { 1: "1 — Poor", 2: "2 — Fair", 3: "3 — Good", 4: "4 — Very Good", 5: "5 — Excellent" };
    return labels[val] ?? val;
  }

  displayChoice(field: string): string {
    const val = this.form.value[field];
    if (!val) return "—";
    const labels: Record<string, string> = {
      fully: "Fully achieved",
      partially: "Partially achieved",
      not_met: "Not achieved",
    };
    return labels[val] ?? val;
  }

  submit(): void {
    if (this.form.invalid) {
      this.markStepTouched(this.currentStep());
      return;
    }
    this.submitted.set(true);
    this.router.navigate(["/app/my-evaluations"]);
  }

  cancel(): void {
    this.router.navigate(["/app/my-evaluations"]);
  }
}

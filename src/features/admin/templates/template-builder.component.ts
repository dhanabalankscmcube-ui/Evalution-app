import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatMenuModule } from "@angular/material/menu";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import { EvaluationTemplateService } from "../../../core/services/domain.services";
import type {
  EvaluationTemplate,
  EvaluationSection,
  EvaluationQuestion,
  QuestionType,
} from "../../../core/models";

@Component({
  selector: "app-template-builder",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    MatExpansionModule, MatSlideToggleModule, MatMenuModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Form Builder" [subtitle]="template()?.name ?? ''" [breadcrumbs]="breadcrumbs">
      <button mat-stroked-button (click)="back()">
        <mat-icon>arrow_back</mat-icon> Back to Templates
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (template()) {
      <div class="space-y-4">
        <!-- Sections -->
        @for (section of sections(); track section.id; let i = $index) {
          <mat-expansion-panel [expanded]="true" class="shadow-sm">
            <mat-expansion-panel-header>
              <mat-panel-title class="font-semibold text-slate-900">
                {{ i + 1 }}. {{ section.title }}
              </mat-panel-title>
              <mat-panel-description>
                {{ section.questions?.length ?? 0 }} question(s)
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="p-4 space-y-3">
              <!-- Questions -->
              @for (q of section.questions; track q.id; let qi = $index) {
                <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-semibold text-slate-400">Q{{ qi + 1 }}</span>
                        <span class="badge badge-draft">{{ q.question_type }}</span>
                        @if (q.is_required) {
                          <span class="text-xs text-red-500">*required</span>
                        }
                      </div>
                      <p class="text-sm font-medium text-slate-800">{{ q.text }}</p>
                      @if (q.description) {
                        <p class="text-xs text-slate-500 mt-1">{{ q.description }}</p>
                      }
                      @if (q.options) {
                        <div class="flex flex-wrap gap-1 mt-2">
                          @for (opt of q.options; track opt) {
                            <span class="text-xs bg-white border border-slate-200 rounded px-2 py-0.5">{{ opt }}</span>
                          }
                        </div>
                      }
                    </div>
                    <button mat-icon-button [matMenuTriggerFor]="qMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #qMenu="matMenu">
                      <button mat-menu-item (click)="editQuestion(section, q)">
                        <mat-icon>edit</mat-icon> Edit
                      </button>
                      <button mat-menu-item class="text-red-600" (click)="deleteQuestion(section, q)">
                        <mat-icon>delete</mat-icon> Delete
                      </button>
                    </mat-menu>
                  </div>
                </div>
              }

              @if ((section.questions?.length ?? 0) === 0) {
                <p class="text-sm text-slate-400 text-center py-4">No questions yet.</p>
              }

              <button mat-stroked-button color="primary" (click)="addQuestion(section)" class="w-full">
                <mat-icon>add</mat-icon> Add Question
              </button>
            </div>
          </mat-expansion-panel>
        }

        @if (sections().length === 0) {
          <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <mat-icon class="text-4xl">layers</mat-icon>
            <p class="mt-2">No sections yet. Add your first section below.</p>
          </div>
        }

        <!-- Add Section -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-3">Add New Section</h3>
          <form [formGroup]="sectionForm" (ngSubmit)="addSection()" class="flex items-end gap-3">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Section Title</mat-label>
              <input matInput formControlName="title" placeholder="e.g. Goals & Achievements" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit">
              <mat-icon>add</mat-icon> Add Section
            </button>
          </form>
        </div>
      </div>
    }

    <!-- Question Dialog -->
    @if (showQuestionDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="closeQuestionDialog()">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">
            {{ editingQuestion() ? 'Edit Question' : 'New Question' }}
          </h3>
          <form [formGroup]="questionForm" class="space-y-3">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Question Text</mat-label>
              <textarea matInput formControlName="text" rows="2"></textarea>
              @if (questionForm.get('text')?.hasError('required') && questionForm.get('text')?.touched) {
                <mat-error>Question text is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description / Help Text</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Question Type</mat-label>
                <select matNativeControl formControlName="question_type" (change)="onTypeChange()">
                  <option value="rating">Rating (1-5)</option>
                  <option value="text">Text Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date Picker</option>
                </select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Display Order</mat-label>
                <input matInput type="number" formControlName="display_order" />
              </mat-form-field>
            </div>
            <div class="flex items-center gap-4">
              <mat-slide-toggle formControlName="is_required">Required</mat-slide-toggle>
            </div>
            @if (questionForm.value.question_type === 'rating') {
              <div class="grid grid-cols-2 gap-3">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Min Rating</mat-label>
                  <input matInput type="number" formControlName="min_rating" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Max Rating</mat-label>
                  <input matInput type="number" formControlName="max_rating" />
                </mat-form-field>
              </div>
            }
            @if (questionForm.value.question_type === 'dropdown' || questionForm.value.question_type === 'checkbox') {
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Options (one per line)</mat-label>
                <textarea matInput formControlName="options" rows="3" placeholder="Option 1&#10;Option 2&#10;Option 3"></textarea>
              </mat-form-field>
            }
            <div class="flex justify-end gap-2 pt-2">
              <button mat-stroked-button type="button" (click)="closeQuestionDialog()">Cancel</button>
              <button mat-flat-button color="primary" type="button" (click)="saveQuestion()">
                {{ editingQuestion() ? 'Update' : 'Add' }} Question
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class TemplateBuilderComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private templateService = inject(EvaluationTemplateService);
  private toast = inject(ToastService);

  templateId!: string;
  template = signal<EvaluationTemplate | null>(null);
  sections = signal<EvaluationSection[]>([]);
  loading = signal(false);

  showQuestionDialog = signal(false);
  editingQuestion = signal<EvaluationQuestion | null>(null);
  currentSection = signal<EvaluationSection | null>(null);

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Templates", url: "/app/admin/templates" },
    { label: "Form Builder" },
  ];

  sectionForm = this.fb.group({
    title: ["", [Validators.required]],
    description: [""],
  });

  questionForm = this.fb.group({
    text: ["", [Validators.required]],
    description: [""],
    question_type: ["rating" as QuestionType],
    display_order: [1],
    is_required: [true],
    min_rating: [1],
    max_rating: [5],
    options: [""],
  });

  async ngOnInit() {
    this.templateId = this.route.snapshot.paramMap.get("id")!;
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const data = await this.templateService.getById(this.templateId);
      this.template.set(data);
      const sorted = (data?.sections ?? []).sort((a, b) => a.display_order - b.display_order);
      sorted.forEach((s) =>
        (s.questions ?? []).sort((a, b) => a.display_order - b.display_order)
      );
      this.sections.set(sorted);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async addSection() {
    if (this.sectionForm.invalid) { this.sectionForm.markAllAsTouched(); return; }
    try {
      const order = this.sections().length + 1;
      await this.templateService.addSection({
        template_id: this.templateId,
        title: this.sectionForm.value.title,
        description: this.sectionForm.value.description,
        display_order: order,
        is_active: true,
      } as any);
      this.toast.success("Section added");
      this.sectionForm.reset({ title: "", description: "" });
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  addQuestion(section: EvaluationSection) {
    this.currentSection.set(section);
    this.editingQuestion.set(null);
    const nextOrder = (section.questions?.length ?? 0) + 1;
    this.questionForm.reset({
      text: "", description: "", question_type: "rating",
      display_order: nextOrder, is_required: true,
      min_rating: 1, max_rating: 5, options: "",
    });
    this.showQuestionDialog.set(true);
  }

  editQuestion(section: EvaluationSection, q: EvaluationQuestion) {
    this.currentSection.set(section);
    this.editingQuestion.set(q);
    this.questionForm.reset({
      text: q.text,
      description: q.description ?? "",
      question_type: q.question_type,
      display_order: q.display_order,
      is_required: q.is_required,
      min_rating: q.min_rating ?? 1,
      max_rating: q.max_rating ?? 5,
      options: (q.options ?? []).join("\n"),
    });
    this.showQuestionDialog.set(true);
  }

  closeQuestionDialog() {
    this.showQuestionDialog.set(false);
    this.editingQuestion.set(null);
    this.currentSection.set(null);
  }

  onTypeChange() {
    const type = this.questionForm.value.question_type;
    if (type === "rating") {
      this.questionForm.patchValue({ min_rating: 1, max_rating: 5 });
    }
  }

  async saveQuestion() {
    if (this.questionForm.invalid) { this.questionForm.markAllAsTouched(); return; }
    const section = this.currentSection();
    if (!section) return;

    const v = this.questionForm.value;
    const payload: any = {
      section_id: section.id,
      text: v.text,
      description: v.description || null,
      question_type: v.question_type,
      display_order: v.display_order ?? 1,
      is_required: v.is_required ?? true,
      is_active: true,
    };

    if (v.question_type === "rating") {
      payload.min_rating = v.min_rating ?? 1;
      payload.max_rating = v.max_rating ?? 5;
      payload.weight = 1.0;
    }

    if (v.question_type === "dropdown" || v.question_type === "checkbox") {
      const opts = (v.options ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      payload.options = opts.length > 0 ? opts : null;
    }

    try {
      const editing = this.editingQuestion();
      if (editing) {
        await this.templateService.updateQuestion(editing.id, payload);
        this.toast.success("Question updated");
      } else {
        await this.templateService.addQuestion(payload);
        this.toast.success("Question added");
      }
      this.closeQuestionDialog();
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  async deleteQuestion(section: EvaluationSection, q: EvaluationQuestion) {
    if (!confirm(`Delete question "${q.text}"?`)) return;
    try {
      await this.templateService.deleteQuestion(q.id);
      this.toast.success("Question deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  back() {
    this.router.navigate(["/app/admin/templates"]);
  }
}

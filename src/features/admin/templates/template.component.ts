import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatExpansionModule } from "@angular/material/expansion";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import {
  EvaluationTemplateService,
  ReviewPeriodService,
} from "../../../core/services/domain.services";
import type {
  EvaluationTemplate,
  EvaluationSection,
  EvaluationQuestion,
  ReviewPeriod,
  QuestionType,
  QueryParams,
} from "../../../core/models";

@Component({
  selector: "app-template-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Evaluation Templates" subtitle="Manage dynamic evaluation forms"
      [breadcrumbs]="breadcrumbs" [actions]="true">
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add Template
      </button>
    </app-page-header>

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>Search templates…</mat-label>
        <input matInput [value]="search()" (input)="onSearch($event)" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (data().length === 0) {
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        <mat-icon class="text-4xl">description</mat-icon>
        <p class="mt-2">No templates found.</p>
      </div>
    } @else {
      <div class="space-y-3">
        @for (item of data(); track item.id) {
          <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                  <mat-icon>description</mat-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900">{{ item.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    @if (item.code) {
                      <span class="text-xs text-slate-500 font-mono">{{ item.code }}</span>
                    }
                    <span class="badge {{ item.status === 'active' ? 'badge-approved' : 'badge-draft' }}">
                      {{ item.status }}
                    </span>
                    <span class="text-xs text-slate-400">v{{ item.version }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="edit(item)"><mat-icon>edit</mat-icon> Edit</button>
                  <button mat-menu-item (click)="builder(item)"><mat-icon>build</mat-icon> Form Builder</button>
                  <button mat-menu-item class="text-red-600" (click)="remove(item)">
                    <mat-icon>delete</mat-icon> Delete
                  </button>
                </mat-menu>
              </div>
            </div>
            @if (item.description) {
              <p class="text-sm text-slate-500 mt-3">{{ item.description }}</p>
            }
            @if (item.review_period) {
              <p class="text-xs text-slate-400 mt-2">Period: {{ item.review_period.name }}</p>
            }
          </div>
        }
      </div>
    }
  `,
})
export class TemplateListComponent {
  private templateService = inject(EvaluationTemplateService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<EvaluationTemplate[]>([]);
  loading = signal(false);
  search = signal("");
  private searchTimeout: any;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Templates" },
  ];

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const params: QueryParams = { page: 1, pageSize: 100, search: this.search() || undefined };
      const result = await this.templateService.getAll(params);
      this.data.set(result.data);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.load(), 300);
  }

  add() { this.router.navigate(["/app/admin/templates/new"]); }
  edit(item: EvaluationTemplate) { this.router.navigate(["/app/admin/templates", item.id]); }
  builder(item: EvaluationTemplate) { this.router.navigate(["/app/admin/templates", item.id, "builder"]); }

  async remove(item: EvaluationTemplate) {
    if (!confirm(`Delete template "${item.name}"?`)) return;
    try {
      await this.templateService.delete(item.id);
      this.toast.success("Template deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }
}

@Component({
  selector: "app-template-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Edit Template' : 'New Template'"
      subtitle="Create or update an evaluation template" [breadcrumbs]="breadcrumbs" />

    <div class="max-w-2xl">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <mat-progress-spinner diameter="36" mode="indeterminate" />
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Template Name</mat-label>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" placeholder="e.g. STD-PR-001" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Review Period</mat-label>
              <select matNativeControl formControlName="review_period_id">
                <option value="">— None —</option>
                @for (period of periods(); track period.id) {
                  <option [value]="period.id">{{ period.name }}</option>
                }
              </select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Status</mat-label>
              <select matNativeControl formControlName="status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </mat-form-field>
            <div class="flex items-center gap-3 pt-2">
              <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) {
                  <mat-progress-spinner diameter="20" mode="indeterminate" />
                } @else {
                  {{ isEdit() ? 'Update' : 'Create' }}
                }
              </button>
              <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
              @if (isEdit()) {
                <button mat-stroked-button type="button" (click)="goToBuilder()">
                  <mat-icon>build</mat-icon> Form Builder
                </button>
              }
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class TemplateFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private templateService = inject(EvaluationTemplateService);
  private periodService = inject(ReviewPeriodService);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  id: string | null = null;
  periods = signal<ReviewPeriod[]>([]);

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Templates", url: "/app/admin/templates" },
  ];

  form = this.fb.group({
    name: ["", [Validators.required]],
    code: [""],
    description: [""],
    review_period_id: [""],
    status: ["draft"],
  });

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.isEdit.set(true);
      this.breadcrumbs.push({ label: "Edit" });
    } else {
      this.breadcrumbs.push({ label: "New" });
    }

    try {
      this.periods.set(await this.periodService.getAllActive());
    } catch (err: any) {
      this.toast.error(err.message);
    }

    if (this.id) {
      this.loading.set(true);
      try {
        const item = await this.templateService.getById(this.id);
        if (item) {
          this.form.patchValue({
            name: item.name,
            code: item.code ?? "",
            description: item.description ?? "",
            review_period_id: item.review_period_id ?? "",
            status: item.status,
          });
        }
      } catch (err: any) {
        this.toast.error(err.message);
      } finally {
        this.loading.set(false);
      }
    }
  }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const payload = { ...this.form.value, review_period_id: this.form.value.review_period_id || null } as any;
      if (this.isEdit() && this.id) {
        await this.templateService.update(this.id, payload);
        this.toast.success("Template updated");
      } else {
        const created = await this.templateService.create(payload);
        this.toast.success("Template created");
        this.router.navigate(["/app/admin/templates", created.id, "builder"]);
        return;
      }
      this.router.navigate(["/app/admin/templates"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  goToBuilder() {
    if (this.id) this.router.navigate(["/app/admin/templates", this.id, "builder"]);
  }

  cancel() { this.router.navigate(["/app/admin/templates"]); }
}

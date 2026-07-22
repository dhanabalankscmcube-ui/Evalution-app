import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../../shared/components/status-badge.component";
import { ToastService } from "../../../core/services/toast.service";
import { ReviewPeriodService } from "../../../core/services/domain.services";
import type { ReviewPeriod, QueryParams } from "../../../core/models";

@Component({
  selector: "app-review-period-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatProgressSpinnerModule, PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="Review Periods" subtitle="Manage evaluation cycles and periods"
      [breadcrumbs]="breadcrumbs" [actions]="true">
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add Period
      </button>
    </app-page-header>

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>Search periods…</mat-label>
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
        <mat-icon class="text-4xl">event</mat-icon>
        <p class="mt-2">No review periods found.</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of data(); track item.id) {
          <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                  <mat-icon>event</mat-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900">{{ item.name }}</h3>
                  @if (item.code) {
                    <span class="text-xs text-slate-500 font-mono">{{ item.code }}</span>
                  }
                </div>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="edit(item)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item class="text-red-600" (click)="remove(item)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-menu>
            </div>
            @if (item.description) {
              <p class="text-sm text-slate-500 mb-3 line-clamp-2">{{ item.description }}</p>
            }
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>{{ item.start_date | date:'mediumDate' }} — {{ item.end_date | date:'mediumDate' }}</span>
              <app-status-badge [status]="item.status" />
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class ReviewPeriodListComponent {
  private periodService = inject(ReviewPeriodService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<ReviewPeriod[]>([]);
  loading = signal(false);
  search = signal("");
  private searchTimeout: any;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Review Periods" },
  ];

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const params: QueryParams = { page: 1, pageSize: 100, search: this.search() || undefined };
      const result = await this.periodService.getAll(params);
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

  add() { this.router.navigate(["/app/admin/review-periods/new"]); }
  edit(item: ReviewPeriod) { this.router.navigate(["/app/admin/review-periods", item.id]); }

  async remove(item: ReviewPeriod) {
    if (!confirm(`Delete period "${item.name}"?`)) return;
    try {
      await this.periodService.delete(item.id);
      this.toast.success("Review period deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }
}

@Component({
  selector: "app-review-period-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Edit Review Period' : 'New Review Period'"
      subtitle="Create or update an evaluation cycle" [breadcrumbs]="breadcrumbs" />

    <div class="max-w-2xl">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <mat-progress-spinner diameter="36" mode="indeterminate" />
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Period Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Q1 2026 Performance Review" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" placeholder="e.g. Q1-2026" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="start_date" />
                <mat-datepicker-toggle matSuffix [for]="startPicker" />
                <mat-datepicker #startPicker />
                @if (form.get('start_date')?.hasError('required') && form.get('start_date')?.touched) {
                  <mat-error>Start date is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="end_date" />
                <mat-datepicker-toggle matSuffix [for]="endPicker" />
                <mat-datepicker #endPicker />
                @if (form.get('end_date')?.hasError('required') && form.get('end_date')?.touched) {
                  <mat-error>End date is required</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Status</mat-label>
              <select matNativeControl formControlName="status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
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
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class ReviewPeriodFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private periodService = inject(ReviewPeriodService);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  id: string | null = null;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Review Periods", url: "/app/admin/review-periods" },
  ];

  form = this.fb.group({
    name: ["", [Validators.required]],
    code: [""],
    description: [""],
    start_date: ["", [Validators.required]],
    end_date: ["", [Validators.required]],
    status: ["draft", [Validators.required]],
  });

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.isEdit.set(true);
      this.breadcrumbs.push({ label: "Edit" });
      this.loading.set(true);
      try {
        const item = await this.periodService.getById(this.id);
        if (item) {
          this.form.patchValue({
            name: item.name,
            code: item.code ?? "",
            description: item.description ?? "",
            start_date: item.start_date,
            end_date: item.end_date,
            status: item.status,
          });
        }
      } catch (err: any) {
        this.toast.error(err.message);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.breadcrumbs.push({ label: "New" });
    }
  }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const payload = {
        ...this.form.value as any,
        start_date: this.formatDate(this.form.value.start_date),
        end_date: this.formatDate(this.form.value.end_date),
      };
      if (this.isEdit() && this.id) {
        await this.periodService.update(this.id, payload);
        this.toast.success("Review period updated");
      } else {
        await this.periodService.create(payload);
        this.toast.success("Review period created");
      }
      this.router.navigate(["/app/admin/review-periods"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  private formatDate(date: any): string {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  }

  cancel() { this.router.navigate(["/app/admin/review-periods"]); }
}

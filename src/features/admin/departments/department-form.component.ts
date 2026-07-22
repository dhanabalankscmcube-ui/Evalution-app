import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import { DepartmentService } from "../../../core/services/domain.services";
import type { Department } from "../../../core/models";

@Component({
  selector: "app-department-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      [title]="isEdit() ? 'Edit Department' : 'New Department'"
      subtitle="Create or update a department"
      [breadcrumbs]="breadcrumbs"
    />

    <div class="max-w-2xl">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <mat-progress-spinner diameter="36" mode="indeterminate" />
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Department Name</mat-label>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" placeholder="e.g. ENG" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
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
export class DepartmentFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deptService = inject(DepartmentService);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  id: string | null = null;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Departments", url: "/app/admin/departments" },
  ];

  form = this.fb.group({
    name: ["", [Validators.required]],
    code: [""],
    description: [""],
  });

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.isEdit.set(true);
      this.breadcrumbs.push({ label: "Edit" });
      this.loading.set(true);
      try {
        const dept = await this.deptService.getById(this.id);
        if (dept) {
          this.form.patchValue({
            name: dept.name,
            code: dept.code ?? "",
            description: dept.description ?? "",
          });
        }
      } catch (err: any) {
        this.toast.error(err.message ?? "Failed to load department");
      } finally {
        this.loading.set(false);
      }
    } else {
      this.breadcrumbs.push({ label: "New" });
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.form.value as any;
      if (this.isEdit() && this.id) {
        await this.deptService.update(this.id, payload);
        this.toast.success("Department updated");
      } else {
        await this.deptService.create(payload);
        this.toast.success("Department created");
      }
      this.router.navigate(["/app/admin/departments"]);
    } catch (err: any) {
      this.toast.error(err.message ?? "Failed to save");
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(["/app/admin/departments"]);
  }
}

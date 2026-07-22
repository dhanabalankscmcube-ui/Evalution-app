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
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import { DesignationService } from "../../../core/services/domain.services";
import type { Designation, QueryParams } from "../../../core/models";

@Component({
  selector: "app-designation-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Designations" subtitle="Manage job titles and designations"
      [breadcrumbs]="breadcrumbs" [actions]="true">
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add Designation
      </button>
    </app-page-header>

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>Search designations…</mat-label>
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
        <mat-icon class="text-4xl">work</mat-icon>
        <p class="mt-2">No designations found.</p>
      </div>
    } @else {
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of data(); track item.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-900">{{ item.name }}</td>
                <td class="px-4 py-3 text-slate-600 font-mono text-sm">{{ item.code || '—' }}</td>
                <td class="px-4 py-3 text-slate-500 text-sm max-w-xs truncate">{{ item.description || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="badge {{ item.is_active ? 'badge-approved' : 'badge-rejected' }}">
                    {{ item.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="edit(item)"><mat-icon>edit</mat-icon> Edit</button>
                    <button mat-menu-item class="text-red-600" (click)="remove(item)">
                      <mat-icon>delete</mat-icon> Delete
                    </button>
                  </mat-menu>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class DesignationListComponent {
  private designationService = inject(DesignationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<Designation[]>([]);
  loading = signal(false);
  search = signal("");
  private searchTimeout: any;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Designations" },
  ];

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const params: QueryParams = { page: 1, pageSize: 100, search: this.search() || undefined };
      const result = await this.designationService.getAll(params);
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

  add() { this.router.navigate(["/app/admin/designations/new"]); }
  edit(item: Designation) { this.router.navigate(["/app/admin/designations", item.id]); }

  async remove(item: Designation) {
    if (!confirm(`Delete designation "${item.name}"?`)) return;
    try {
      await this.designationService.delete(item.id);
      this.toast.success("Designation deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }
}

@Component({
  selector: "app-designation-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Edit Designation' : 'New Designation'"
      subtitle="Create or update a job designation" [breadcrumbs]="breadcrumbs" />

    <div class="max-w-2xl">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <mat-progress-spinner diameter="36" mode="indeterminate" />
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Designation Name</mat-label>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" placeholder="e.g. SE" />
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
export class DesignationFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private designationService = inject(DesignationService);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  id: string | null = null;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Designations", url: "/app/admin/designations" },
  ];

  form = this.fb.group({
    name: ["", [Validators.required]],
    code: [""],
    description: [""],
  });

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.isEdit.set(true);
      this.breadcrumbs.push({ label: "Edit" });
      this.loading.set(true);
      try {
        const item = await this.designationService.getById(this.id);
        if (item) this.form.patchValue(item);
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
      const payload = this.form.value as any;
      if (this.isEdit() && this.id) {
        await this.designationService.update(this.id, payload);
        this.toast.success("Designation updated");
      } else {
        await this.designationService.create(payload);
        this.toast.success("Designation created");
      }
      this.router.navigate(["/app/admin/designations"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  cancel() { this.router.navigate(["/app/admin/designations"]); }
}

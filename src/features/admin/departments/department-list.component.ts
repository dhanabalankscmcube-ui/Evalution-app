import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import { DepartmentService } from "../../../core/services/domain.services";
import type { Department, QueryParams } from "../../../core/models";

@Component({
  selector: "app-department-list",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule, MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Departments"
      subtitle="Manage organizational departments"
      [breadcrumbs]="breadcrumbs"
      [actions]="true"
    >
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add Department
      </button>
    </app-page-header>

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>Search departments…</mat-label>
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
        <mat-icon class="text-4xl">account_tree</mat-icon>
        <p class="mt-2">No departments found.</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (dept of data(); track dept.id) {
          <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                  <mat-icon>account_tree</mat-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900">{{ dept.name }}</h3>
                  @if (dept.code) {
                    <span class="text-xs text-slate-500 font-mono">{{ dept.code }}</span>
                  }
                </div>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="edit(dept)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item class="text-red-600" (click)="remove(dept)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-menu>
            </div>
            @if (dept.description) {
              <p class="text-sm text-slate-500 mt-3 line-clamp-2">{{ dept.description }}</p>
            }
            <div class="flex items-center gap-2 mt-4 text-xs">
              <span class="badge {{ dept.is_active ? 'badge-approved' : 'badge-rejected' }}">
                {{ dept.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class DepartmentListComponent {
  private deptService = inject(DepartmentService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<Department[]>([]);
  loading = signal(false);
  search = signal("");
  private searchTimeout: any;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Departments" },
  ];

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const params: QueryParams = { page: 1, pageSize: 100, search: this.search() || undefined };
      const result = await this.deptService.getAll(params);
      this.data.set(result.data);
    } catch (err: any) {
      this.toast.error(err.message ?? "Failed to load departments");
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.load(), 300);
  }

  add(): void {
    this.router.navigate(["/app/admin/departments/new"]);
  }

  edit(dept: Department): void {
    this.router.navigate(["/app/admin/departments", dept.id]);
  }

  async remove(dept: Department): Promise<void> {
    if (!confirm(`Delete department "${dept.name}"?`)) return;
    try {
      await this.deptService.delete(dept.id);
      this.toast.success("Department deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message ?? "Failed to delete");
    }
  }
}

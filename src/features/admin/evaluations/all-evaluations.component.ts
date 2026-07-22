import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { StatusBadgeComponent } from "../../../shared/components/status-badge.component";
import { ToastService } from "../../../core/services/toast.service";
import { EvaluationService } from "../../../core/services/domain.services";
import type { EmployeeEvaluation, QueryParams } from "../../../core/models";

@Component({
  selector: "app-all-evaluations",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PageHeaderComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header title="All Evaluations" subtitle="View all employee evaluations across the organization"
      [breadcrumbs]="breadcrumbs" />

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <mat-form-field appearance="outline" class="flex-1 min-w-[200px]">
        <mat-label>Search…</mat-label>
        <input matInput [value]="search()" (input)="onSearch($event)" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-48">
        <mat-label>Status</mat-label>
        <select matNativeControl (change)="onStatusFilter($event)">
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="in_review">In Review</option>
          <option value="changes_requested">Changes Requested</option>
          <option value="resubmitted">Resubmitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (data().length === 0) {
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        <mat-icon class="text-4xl">fact_check</mat-icon>
        <p class="mt-2">No evaluations found.</p>
      </div>
    } @else {
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Period</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Template</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Submitted</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (ev of data(); track ev.id) {
              <tr class="hover:bg-slate-50 transition-colors cursor-pointer" (click)="view(ev)">
                <td class="px-4 py-3">
                  <div class="font-medium text-slate-900">
                    {{ ev.employee?.first_name }} {{ ev.employee?.last_name }}
                  </div>
                  <div class="text-xs text-slate-500">{{ ev.employee?.email }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ ev.review_period?.name }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ ev.template?.name }}</td>
                <td class="px-4 py-3"><app-status-badge [status]="ev.status" /></td>
                <td class="px-4 py-3 text-sm text-slate-500">
                  {{ ev.submitted_at ? (ev.submitted_at | date:'short') : '—' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button mat-icon-button (click)="$event.stopPropagation(); view(ev)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AllEvaluationsComponent {
  private evalService = inject(EvaluationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<EmployeeEvaluation[]>([]);
  loading = signal(false);
  search = signal("");
  statusFilter = signal("");
  private searchTimeout: any;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "All Evaluations" },
  ];

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const params: QueryParams = {
        search: this.search() || undefined,
        filters: this.statusFilter() ? { ['status']: this.statusFilter() } : undefined,
      };
      this.data.set(await this.evalService.getAllEvaluations(params));
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

  onStatusFilter(event: Event) {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.load();
  }

  view(ev: EmployeeEvaluation) {
    this.router.navigate(["/app/admin/evaluations", ev.id]);
  }
}

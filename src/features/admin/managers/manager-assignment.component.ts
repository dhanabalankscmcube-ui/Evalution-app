import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import {
  ManagerService,
  EmployeeService,
  DepartmentService,
} from "../../../core/services/domain.services";
import type {
  ManagerAssignment,
  Employee,
  Department,
} from "../../../core/models";

@Component({
  selector: "app-manager-assignment-list",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule, MatMenuModule,
    MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Manager Assignments" subtitle="Assign managers to departments"
      [breadcrumbs]="breadcrumbs" [actions]="true">
      <button mat-flat-button color="primary" (click)="showDialog.set(true)">
        <mat-icon>add</mat-icon> Assign Manager
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else if (assignments().length === 0) {
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        <mat-icon class="text-4xl">supervisor_account</mat-icon>
        <p class="mt-2">No manager assignments yet.</p>
      </div>
    } @else {
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Manager</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Primary</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Start Date</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of assignments(); track item.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-900">
                  {{ item.employee?.first_name }} {{ item.employee?.last_name }}
                </td>
                <td class="px-4 py-3 text-slate-600">{{ item.department?.name }}</td>
                <td class="px-4 py-3">
                  @if (item.is_primary) {
                    <span class="badge badge-approved">Primary</span>
                  } @else {
                    <span class="text-slate-400">—</span>
                  }
                </td>
                <td class="px-4 py-3 text-sm text-slate-500">{{ item.start_date | date:'mediumDate' }}</td>
                <td class="px-4 py-3 text-right">
                  <button mat-icon-button (click)="remove(item)">
                    <mat-icon class="text-red-500">delete</mat-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Assignment Dialog -->
    @if (showDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showDialog.set(false)">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Assign Manager</h3>
          <form [formGroup]="form" (ngSubmit)="assign()" class="space-y-3">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Employee</mat-label>
              <select matNativeControl formControlName="employee_id">
                <option value="">— Select —</option>
                @for (emp of employees(); track emp.id) {
                  <option [value]="emp.id">{{ emp.first_name }} {{ emp.last_name }} ({{ emp.employee_number }})</option>
                }
              </select>
              @if (form.get('employee_id')?.hasError('required') && form.get('employee_id')?.touched) {
                <mat-error>Required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Department</mat-label>
              <select matNativeControl formControlName="department_id">
                <option value="">— Select —</option>
                @for (dept of departments(); track dept.id) {
                  <option [value]="dept.id">{{ dept.name }}</option>
                }
              </select>
              @if (form.get('department_id')?.hasError('required') && form.get('department_id')?.touched) {
                <mat-error>Required</mat-error>
              }
            </mat-form-field>
            <div class="flex items-center gap-4">
              <mat-checkbox formControlName="is_primary">Primary Manager</mat-checkbox>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="start_date" />
              <mat-datepicker-toggle matSuffix [for]="picker" />
              <mat-datepicker #picker />
            </mat-form-field>
            <div class="flex justify-end gap-2 pt-2">
              <button mat-stroked-button type="button" (click)="showDialog.set(false)">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                @if (saving()) {
                  <mat-progress-spinner diameter="20" mode="indeterminate" />
                } @else {
                  Assign
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ManagerAssignmentListComponent {
  private fb = inject(FormBuilder);
  private managerService = inject(ManagerService);
  private employeeService = inject(EmployeeService);
  private deptService = inject(DepartmentService);
  private toast = inject(ToastService);

  assignments = signal<ManagerAssignment[]>([]);
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  saving = signal(false);

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Manager Assignments" },
  ];

  form = this.fb.group({
    employee_id: ["", [Validators.required]],
    department_id: ["", [Validators.required]],
    is_primary: [false],
    start_date: [""],
  });

  async ngOnInit() {
    await this.load();
    try {
      const [emps, depts] = await Promise.all([
        this.employeeService.getAll({ page: 1, pageSize: 200 }),
        this.deptService.getAllActive(),
      ]);
      this.employees.set(emps.data);
      this.departments.set(depts);
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  async load() {
    this.loading.set(true);
    try {
      this.assignments.set(await this.managerService.getAll());
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async assign() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const v = this.form.value;
      await this.managerService.assign({
        employee_id: v.employee_id,
        department_id: v.department_id,
        is_primary: v.is_primary ?? false,
        start_date: this.formatDate(v.start_date),
        is_active: true,
      } as any);
      this.toast.success("Manager assigned");
      this.showDialog.set(false);
      this.form.reset({ employee_id: "", department_id: "", is_primary: false, start_date: "" });
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(item: ManagerAssignment) {
    if (!confirm("Remove this manager assignment?")) return;
    try {
      await this.managerService.remove(item.id);
      this.toast.success("Assignment removed");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  private formatDate(date: any): string | null {
    if (!date) return null;
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  }
}

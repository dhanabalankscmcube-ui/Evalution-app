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
import { ToastService } from "../../../core/services/toast.service";
import {
  EmployeeService,
  DepartmentService,
  DesignationService,
} from "../../../core/services/domain.services";
import type { Employee, Department, Designation, QueryParams } from "../../../core/models";

@Component({
  selector: "app-employee-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Employees" subtitle="Manage employee profiles and assignments"
      [breadcrumbs]="breadcrumbs" [actions]="true">
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add Employee
      </button>
    </app-page-header>

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>Search employees…</mat-label>
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
        <mat-icon class="text-4xl">badge</mat-icon>
        <p class="mt-2">No employees found.</p>
      </div>
    } @else {
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Dept / Designation</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Manager</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (emp of data(); track emp.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {{ emp.first_name[0] }}{{ emp.last_name[0] }}
                    </div>
                    <div>
                      <div class="font-medium text-slate-900">{{ emp.first_name }} {{ emp.last_name }}</div>
                      <div class="text-xs text-slate-500">{{ emp.email }} · {{ emp.employee_number }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="text-slate-700">{{ emp.department?.name || '—' }}</div>
                  <div class="text-xs text-slate-500">{{ emp.designation?.name || '—' }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">
                  {{ emp.manager ? emp.manager.first_name + ' ' + emp.manager.last_name : '—' }}
                </td>
                <td class="px-4 py-3">
                  <span class="badge {{ emp.status === 'active' ? 'badge-approved' : 'badge-rejected' }}">
                    {{ emp.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="edit(emp)"><mat-icon>edit</mat-icon> Edit</button>
                    <button mat-menu-item class="text-red-600" (click)="remove(emp)">
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
export class EmployeeListComponent {
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<Employee[]>([]);
  loading = signal(false);
  search = signal("");
  private searchTimeout: any;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Employees" },
  ];

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const params: QueryParams = { page: 1, pageSize: 100, search: this.search() || undefined };
      const result = await this.employeeService.getAll(params);
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

  add() { this.router.navigate(["/app/admin/employees/new"]); }
  edit(emp: Employee) { this.router.navigate(["/app/admin/employees", emp.id]); }

  async remove(emp: Employee) {
    if (!confirm(`Delete employee "${emp.first_name} ${emp.last_name}"?`)) return;
    try {
      await this.employeeService.delete(emp.id);
      this.toast.success("Employee deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }
}

@Component({
  selector: "app-employee-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Edit Employee' : 'New Employee'"
      subtitle="Create or update an employee profile" [breadcrumbs]="breadcrumbs" />

    <div class="max-w-3xl">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <mat-progress-spinner diameter="36" mode="indeterminate" />
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name" />
                @if (form.get('first_name')?.hasError('required') && form.get('first_name')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name" />
                @if (form.get('last_name')?.hasError('required') && form.get('last_name')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
                @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Employee Number</mat-label>
                <input matInput formControlName="employee_number" placeholder="e.g. EMP-001" />
                @if (form.get('employee_number')?.hasError('required') && form.get('employee_number')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Hire Date</mat-label>
                <input matInput [matDatepicker]="hirePicker" formControlName="hire_date" />
                <mat-datepicker-toggle matSuffix [for]="hirePicker" />
                <mat-datepicker #hirePicker />
              </mat-form-field>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Department</mat-label>
                <select matNativeControl formControlName="department_id">
                  <option value="">— Select —</option>
                  @for (dept of departments(); track dept.id) {
                    <option [value]="dept.id">{{ dept.name }}</option>
                  }
                </select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Designation</mat-label>
                <select matNativeControl formControlName="designation_id">
                  <option value="">— Select —</option>
                  @for (desig of designations(); track desig.id) {
                    <option [value]="desig.id">{{ desig.name }}</option>
                  }
                </select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Manager</mat-label>
              <select matNativeControl formControlName="manager_id">
                <option value="">— None —</option>
                @for (mgr of managers(); track mgr.id) {
                  <option [value]="mgr.id">{{ mgr.first_name }} {{ mgr.last_name }}</option>
                }
              </select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Status</mat-label>
              <select matNativeControl formControlName="status">
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
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
export class EmployeeFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private deptService = inject(DepartmentService);
  private designationService = inject(DesignationService);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  id: string | null = null;

  departments = signal<Department[]>([]);
  designations = signal<Designation[]>([]);
  managers = signal<Employee[]>([]);

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Employees", url: "/app/admin/employees" },
  ];

  form = this.fb.group({
    first_name: ["", [Validators.required]],
    last_name: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    employee_number: ["", [Validators.required]],
    phone: [""],
    hire_date: [""],
    department_id: [""],
    designation_id: [""],
    manager_id: [""],
    status: ["active"],
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
      const [depts, desigs, emps] = await Promise.all([
        this.deptService.getAllActive(),
        this.designationService.getAllActive(),
        this.employeeService.getAll({ page: 1, pageSize: 200 }),
      ]);
      this.departments.set(depts);
      this.designations.set(desigs);
      this.managers.set(emps.data);
    } catch (err: any) {
      this.toast.error(err.message);
    }

    if (this.id) {
      this.loading.set(true);
      try {
        const emp = await this.employeeService.getById(this.id);
        if (emp) {
          this.form.patchValue({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            employee_number: emp.employee_number,
            phone: emp.phone ?? "",
            hire_date: emp.hire_date,
            department_id: emp.department_id ?? "",
            designation_id: emp.designation_id ?? "",
            manager_id: emp.manager_id ?? "",
            status: emp.status,
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
      const payload = {
        ...this.form.value as any,
        hire_date: this.formatDate(this.form.value.hire_date),
        department_id: this.form.value.department_id || null,
        designation_id: this.form.value.designation_id || null,
        manager_id: this.form.value.manager_id || null,
      };
      if (this.isEdit() && this.id) {
        await this.employeeService.update(this.id, payload);
        this.toast.success("Employee updated");
      } else {
        await this.employeeService.create(payload);
        this.toast.success("Employee created");
      }
      this.router.navigate(["/app/admin/employees"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  private formatDate(date: any): string | null {
    if (!date) return null;
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  }

  cancel() { this.router.navigate(["/app/admin/employees"]); }
}

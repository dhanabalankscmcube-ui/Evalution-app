import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { AuthService } from "../../core/auth/auth.service";
import { ToastService } from "../../core/services/toast.service";
import {
  EmployeeService,
  DepartmentService,
  DesignationService,
} from "../../core/services/domain.services";
import type { Employee, Department, Designation } from "../../core/models";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="My Profile" subtitle="View and update your personal information"
      [breadcrumbs]="breadcrumbs" />

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else {
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div class="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {{ auth.initials() }}
          </div>
          <h3 class="font-semibold text-slate-900 text-lg">{{ auth.fullName() }}</h3>
          <p class="text-sm text-slate-500">{{ auth.user()?.email }}</p>

          @if (employee()) {
            <div class="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-left">
              <div class="flex justify-between">
                <span class="text-slate-500">Employee #</span>
                <span class="font-medium text-slate-900">{{ employee()?.employee_number }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Department</span>
                <span class="font-medium text-slate-900">{{ employee()?.department?.name || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Designation</span>
                <span class="font-medium text-slate-900">{{ employee()?.designation?.name || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Hire Date</span>
                <span class="font-medium text-slate-900">{{ employee()?.hire_date | date:'mediumDate' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Manager</span>
                <span class="font-medium text-slate-900">
                  {{ employee()?.manager ? employee()?.manager?.first_name + ' ' + employee()?.manager?.last_name : '—' }}
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Edit Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl border border-slate-200 p-6">
            <h3 class="font-semibold text-slate-900 mb-4">Edit Profile</h3>
            <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="first_name" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="last_name" />
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" [readonly]="true" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>
              <div class="flex items-center gap-3 pt-2">
                <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
                  @if (saving()) {
                    <mat-progress-spinner diameter="20" mode="indeterminate" />
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </form>
          </div>

          <!-- Change Password -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 mt-6">
            <h3 class="font-semibold text-slate-900 mb-4">Change Password</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>New Password</mat-label>
                <input matInput type="password" formControlName="password" />
                @if (passwordForm.get('password')?.hasError('required') && passwordForm.get('password')?.touched) {
                  <mat-error>Required</mat-error>
                }
                @if (passwordForm.get('password')?.hasError('minlength') && passwordForm.get('password')?.touched) {
                  <mat-error>Min 6 characters</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Confirm Password</mat-label>
                <input matInput type="password" formControlName="confirm" />
                @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirm')?.touched) {
                  <mat-error>Passwords do not match</mat-error>
                }
              </mat-form-field>
              <button mat-stroked-button color="primary" type="submit" [disabled]="changingPassword()">
                @if (changingPassword()) {
                  <mat-progress-spinner diameter="20" mode="indeterminate" />
                } @else {
                  Update Password
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private toast = inject(ToastService);

  loading = signal(false);
  saving = signal(false);
  changingPassword = signal(false);
  employee = signal<Employee | null>(null);

  breadcrumbs: any[] = [{ label: "Dashboard", url: "/app/dashboard" }, { label: "My Profile" }];

  form = this.fb.group({
    first_name: ["", [Validators.required]],
    last_name: ["", [Validators.required]],
    email: [{ value: "", disabled: true }],
    phone: [""],
  });

  passwordForm = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirm: ["", [Validators.required]],
    },
    { validators: (g) => (g.value.password === g.value.confirm ? null : { mismatch: true }) }
  );

  async ngOnInit() {
    this.loading.set(true);
    try {
      const user = this.auth.user();
      if (!user) return;
      this.form.patchValue({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email,
        phone: user.phone ?? "",
      });
      this.employee.set(await this.employeeService.getByUserId(user.id));
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const { error } = await this.auth.updateProfile({
        first_name: this.form.value.first_name!,
        last_name: this.form.value.last_name!,
        phone: this.form.value.phone ?? null,
      });
      if (error) throw new Error(error);
      this.toast.success("Profile updated");
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.changingPassword.set(true);
    try {
      const { error } = await this.auth.updatePassword(this.passwordForm.value.password!);
      if (error) throw new Error(error);
      this.toast.success("Password updated");
      this.passwordForm.reset();
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.changingPassword.set(false);
    }
  }
}

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatCheckboxModule, MatCheckboxChange } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import { RoleService } from "../../../core/services/domain.services";
import type { Role, Permission, QueryParams } from "../../../core/models";
import { MOCK_PERMISSIONS } from "../../../core/services/mock-data";

@Component({
  selector: "app-role-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatProgressSpinnerModule, MatCheckboxModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Roles & Permissions" subtitle="Manage roles and their permissions"
      [breadcrumbs]="breadcrumbs" [actions]="true">
      <button mat-flat-button color="primary" (click)="add()">
        <mat-icon>add</mat-icon> Add Role
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <mat-progress-spinner diameter="40" mode="indeterminate" />
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (role of roles(); track role.id) {
          <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                  <mat-icon>shield</mat-icon>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900">{{ role.name }}</h3>
                  <span class="text-xs text-slate-500 font-mono">{{ role.code }}</span>
                </div>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="edit(role)"><mat-icon>edit</mat-icon> Edit</button>
                <button mat-menu-item (click)="managePermissions(role)">
                  <mat-icon>lock</mat-icon> Permissions
                </button>
                @if (role.code !== 'employee' && role.code !== 'manager' && role.code !== 'hr_admin') {
                  <button mat-menu-item class="text-red-600" (click)="remove(role)">
                    <mat-icon>delete</mat-icon> Delete
                  </button>
                }
              </mat-menu>
            </div>
            <p class="text-sm text-slate-500">{{ role.description || 'No description' }}</p>
            <div class="mt-3 text-xs text-slate-400">
              {{ getPermissionCount(role.id) }} permissions assigned
            </div>
          </div>
        }
      </div>
    }

    <!-- Permissions Dialog -->
    @if (showPermDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="closePermDialog()">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-900 mb-1">Permissions for {{ selectedRole()?.name }}</h3>
          <p class="text-sm text-slate-500 mb-4">Toggle permissions to grant or revoke access</p>
          <div class="space-y-4">
            @for (module of groupedPermissions(); track module.module) {
              <div>
                <h4 class="text-sm font-semibold text-slate-700 mb-2">{{ module.module }}</h4>
                <div class="grid grid-cols-2 gap-2">
                  @for (perm of module.permissions; track perm.id) {
                    <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <mat-checkbox [checked]="isPermissionAssigned(perm.id)"
                        (change)="togglePermission(perm.id, $event.checked)">
                      </mat-checkbox>
                      <div>
                        <div class="text-sm font-medium text-slate-700">{{ perm.name }}</div>
                        <div class="text-xs text-slate-400 font-mono">{{ perm.code }}</div>
                      </div>
                    </label>
                  }
                </div>
              </div>
            }
          </div>
          <div class="flex justify-end pt-4">
            <button mat-flat-button color="primary" (click)="closePermDialog()">Done</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RoleListComponent {
  private roleService = inject(RoleService);
  private router = inject(Router);
  private toast = inject(ToastService);

  roles = signal<Role[]>([]);
  permissions = signal<Permission[]>([]);
  rolePermissionMap = signal<Map<string, boolean>>(new Map());
  loading = signal(false);
  showPermDialog = signal(false);
  selectedRole = signal<Role | null>(null);

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Roles & Permissions" },
  ];

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const roleResult = await this.roleService.getAll({ page: 1, pageSize: 100 });
      const permResult = { data: MOCK_PERMISSIONS } as any;
      this.roles.set(roleResult.data);
      this.permissions.set(permResult.data ?? MOCK_PERMISSIONS);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  groupedPermissions() {
    const groups: { module: string; permissions: Permission[] }[] = [];
    const moduleMap = new Map<string, Permission[]>();
    for (const p of this.permissions()) {
      const mod = p.module ?? "Other";
      if (!moduleMap.has(mod)) moduleMap.set(mod, []);
      moduleMap.get(mod)!.push(p);
    }
    moduleMap.forEach((perms, mod) => groups.push({ module: mod, permissions: perms }));
    return groups;
  }

  getPermissionCount(roleId: string): number {
    let count = 0;
    for (const [key, val] of this.rolePermissionMap()) {
      if (key.startsWith(roleId + ":") && val) count++;
    }
    return count;
  }

  isPermissionAssigned(permId: string): boolean {
    const role = this.selectedRole();
    if (!role) return false;
    return this.rolePermissionMap().get(role.id + ":" + permId) ?? false;
  }

  async togglePermission(permId: string, checked: boolean) {
    const role = this.selectedRole();
    if (!role) return;
    try {
      if (checked) {
        await this.roleService.assignToUser(role.id, permId);
      } else {
        await this.roleService.removeFromUser(role.id, permId);
      }
      const map = new Map(this.rolePermissionMap());
      map.set(role.id + ":" + permId, checked);
      this.rolePermissionMap.set(map);
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  async managePermissions(role: Role) {
    this.selectedRole.set(role);
    try {
      const data: any[] = []; // Mock: no role_permissions table
      const map = new Map<string, boolean>();
      (data ?? []).forEach((rp: any) => map.set(role.id + ":" + rp.permission_id, true));
      this.rolePermissionMap.set(map);
    } catch (err: any) {
      this.toast.error(err.message);
    }
    this.showPermDialog.set(true);
  }

  closePermDialog() {
    this.showPermDialog.set(false);
    this.selectedRole.set(null);
  }

  add() { this.router.navigate(["/app/admin/roles/new"]); }
  edit(role: Role) { this.router.navigate(["/app/admin/roles", role.id]); }

  async remove(role: Role) {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await this.roleService.delete(role.id);
      this.toast.success("Role deleted");
      await this.load();
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }
}

@Component({
  selector: "app-role-form",
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Edit Role' : 'New Role'"
      subtitle="Create or update a role" [breadcrumbs]="breadcrumbs" />

    <div class="max-w-2xl">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <mat-progress-spinner diameter="36" mode="indeterminate" />
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Role Name</mat-label>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code" placeholder="e.g. team_lead" />
              @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
                <mat-error>Code is required</mat-error>
              }
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
export class RoleFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  saving = signal(false);
  id: string | null = null;

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Roles", url: "/app/admin/roles" },
  ];

  form = this.fb.group({
    name: ["", [Validators.required]],
    code: ["", [Validators.required]],
    description: [""],
  });

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.isEdit.set(true);
      this.breadcrumbs.push({ label: "Edit" });
      this.loading.set(true);
      try {
        const role = await this.roleService.getById(this.id);
        if (role) this.form.patchValue(role);
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
        await this.roleService.update(this.id, payload);
        this.toast.success("Role updated");
      } else {
        await this.roleService.create(payload);
        this.toast.success("Role created");
      }
      this.router.navigate(["/app/admin/roles"]);
    } catch (err: any) {
      this.toast.error(err.message);
    } finally {
      this.saving.set(false);
    }
  }

  cancel() { this.router.navigate(["/app/admin/roles"]); }
}

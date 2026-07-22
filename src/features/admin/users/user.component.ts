import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PageHeaderComponent } from "../../../shared/components/page-header.component";
import { ToastService } from "../../../core/services/toast.service";
import { UserService, RoleService } from "../../../core/services/domain.services";
import type { AppUser, Role, QueryParams } from "../../../core/models";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatSelectModule, MatCheckboxModule,
    MatProgressSpinnerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Users" subtitle="Manage application users and their roles"
      [breadcrumbs]="breadcrumbs" />

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>Search users…</mat-label>
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
        <mat-icon class="text-4xl">manage_accounts</mat-icon>
        <p class="mt-2">No users found.</p>
      </div>
    } @else {
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Roles</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (user of data(); track user.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {{ getInitials(user) }}
                    </div>
                    <div>
                      <div class="font-medium text-slate-900">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                      <div class="text-xs text-slate-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    @for (role of getUserRoles(user); track role.id) {
                      <span class="badge badge-submitted">{{ role.name }}</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="badge {{ user.is_active ? 'badge-approved' : 'badge-rejected' }}">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="manageRoles(user)">
                      <mat-icon>shield</mat-icon> Manage Roles
                    </button>
                  </mat-menu>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Role Management Dialog -->
    @if (showRoleDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="closeRoleDialog()">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-900 mb-1">Manage Roles</h3>
          <p class="text-sm text-slate-500 mb-4">
            {{ selectedUser()?.first_name }} {{ selectedUser()?.last_name }} ({{ selectedUser()?.email }})
          </p>
          <div class="space-y-2">
            @for (role of allRoles(); track role.id) {
              <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <mat-checkbox [checked]="hasRole(role.id)"
                  (change)="toggleRole(role.id, $event.checked)">
                </mat-checkbox>
                <div>
                  <div class="text-sm font-medium text-slate-700">{{ role.name }}</div>
                  <div class="text-xs text-slate-400">{{ role.description }}</div>
                </div>
              </label>
            }
          </div>
          <div class="flex justify-end pt-4">
            <button mat-flat-button color="primary" (click)="closeRoleDialog()">Done</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserListComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private toast = inject(ToastService);

  data = signal<AppUser[]>([]);
  allRoles = signal<Role[]>([]);
  loading = signal(false);
  search = signal("");
  private searchTimeout: any;

  showRoleDialog = signal(false);
  selectedUser = signal<AppUser | null>(null);
  private userRoleIds = signal<Set<string>>(new Set());

  breadcrumbs: any[] = [
    { label: "Dashboard", url: "/app/dashboard" },
    { label: "Administration", url: "/app/admin" },
    { label: "Users" },
  ];

  async ngOnInit() {
    await this.load();
    try {
      this.allRoles.set(await this.roleService.getAllActive());
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  async load() {
    this.loading.set(true);
    try {
      const params: QueryParams = { page: 1, pageSize: 100, search: this.search() || undefined };
      const result = await this.userService.getAll(params);
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

  getInitials(user: AppUser): string {
    const f = user.first_name?.[0] ?? "";
    const l = user.last_name?.[0] ?? "";
    return (f + l).toUpperCase() || user.email[0].toUpperCase();
  }

  getUserRoles(user: AppUser): Role[] {
    const userRoles = (user as any).user_roles as any[];
    return (userRoles ?? []).map((ur) => ur.roles as Role).filter(Boolean);
  }

  hasRole(roleId: string): boolean {
    return this.userRoleIds().has(roleId);
  }

  async manageRoles(user: AppUser) {
    this.selectedUser.set(user);
    const roleIds = new Set(this.getUserRoles(user).map((r) => r.id));
    this.userRoleIds.set(roleIds);
    this.showRoleDialog.set(true);
  }

  async toggleRole(roleId: string, checked: boolean) {
    const user = this.selectedUser();
    if (!user) return;
    try {
      if (checked) {
        await this.roleService.assignToUser(user.id, roleId);
      } else {
        await this.roleService.removeFromUser(user.id, roleId);
      }
      const ids = new Set(this.userRoleIds());
      if (checked) ids.add(roleId); else ids.delete(roleId);
      this.userRoleIds.set(ids);
    } catch (err: any) {
      this.toast.error(err.message);
    }
  }

  closeRoleDialog() {
    this.showRoleDialog.set(false);
    this.selectedUser.set(null);
    this.load();
  }
}

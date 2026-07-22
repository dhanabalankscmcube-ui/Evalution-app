import { Injectable, signal, computed } from "@angular/core";
import type { AppUser, Role, RoleCode } from "../models";

// ---------- Demo accounts ----------
export interface DemoAccount {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "employee" | "manager" | "hr_admin";
  roleLabel: string;
  description: string;
  color: string;
  icon: string;
  roles: Role[];
  permissions: string[];
}

const EMPLOYEE_ROLES: Role[] = [
  { id: "role-1", name: "Employee", code: "employee", description: "Standard employee", is_active: true, created_at: "", updated_at: null },
];
const MANAGER_ROLES: Role[] = [
  { id: "role-2", name: "Manager", code: "manager", description: "People manager", is_active: true, created_at: "", updated_at: null },
  { id: "role-1", name: "Employee", code: "employee", description: "Standard employee", is_active: true, created_at: "", updated_at: null },
];
const HR_ROLES: Role[] = [
  { id: "role-3", name: "HR Administrator", code: "hr_admin", description: "HR admin", is_active: true, created_at: "", updated_at: null },
  { id: "role-2", name: "Manager", code: "manager", description: "People manager", is_active: true, created_at: "", updated_at: null },
  { id: "role-1", name: "Employee", code: "employee", description: "Standard employee", is_active: true, created_at: "", updated_at: null },
];

const EMPLOYEE_PERMISSIONS = [
  "employee.profile.view", "employee.profile.update",
  "employee.eval.start", "employee.eval.draft", "employee.eval.submit", "employee.eval.view",
];
const MANAGER_PERMISSIONS = [
  ...EMPLOYEE_PERMISSIONS,
  "manager.team.view", "manager.review.view", "manager.review.rate",
  "manager.review.approve", "manager.review.reject", "manager.review.changes",
];
const HR_PERMISSIONS = [
  ...MANAGER_PERMISSIONS,
  "hr.employees.manage", "hr.departments.manage", "hr.designations.manage",
  "hr.roles.manage", "hr.templates.manage", "hr.periods.manage",
  "hr.managers.assign", "hr.evaluations.view", "hr.users.manage",
];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    userId: "user-1",
    email: "john.doe@company.com",
    password: "password123",
    firstName: "John", lastName: "Doe",
    role: "employee", roleLabel: "Employee",
    description: "View & submit self-evaluations, set goals, review history",
    color: "#2563eb", icon: "person",
    roles: EMPLOYEE_ROLES, permissions: EMPLOYEE_PERMISSIONS,
  },
  {
    userId: "user-2",
    email: "jane.smith@company.com",
    password: "password123",
    firstName: "Jane", lastName: "Smith",
    role: "manager", roleLabel: "Manager",
    description: "Review team evaluations, approve or request changes",
    color: "#7c3aed", icon: "groups",
    roles: MANAGER_ROLES, permissions: MANAGER_PERMISSIONS,
  },
  {
    userId: "user-5",
    email: "tom.brown@company.com",
    password: "password123",
    firstName: "Tom", lastName: "Brown",
    role: "hr_admin", roleLabel: "HR Administrator",
    description: "Full system access: manage employees, templates, all reviews",
    color: "#0f766e", icon: "admin_panel_settings",
    roles: HR_ROLES, permissions: HR_PERMISSIONS,
  },
];

@Injectable({ providedIn: "root" })
export class AuthService {
  private _user = signal<AppUser | null>(null);
  private _roles = signal<Role[]>([]);
  private _permissions = signal<string[]>([]);
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly fullName = computed(() => {
    const u = this._user();
    if (!u) return "";
    return [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
  });
  readonly initials = computed(() => {
    const u = this._user();
    if (!u) return "?";
    const f = u.first_name?.[0] ?? "";
    const l = u.last_name?.[0] ?? "";
    return (f + l).toUpperCase() || u.email[0].toUpperCase();
  });
  readonly roleCodes = computed<RoleCode[]>(() => this._roles().map((r) => r.code));
  readonly isHr = computed(() => this.roleCodes().includes("hr_admin"));
  readonly isManager = computed(() => this.roleCodes().includes("manager"));
  readonly isEmployee = computed(() => this.roleCodes().includes("employee"));

  hasRole(code: RoleCode): boolean { return this.roleCodes().includes(code); }
  hasAnyRole(codes: RoleCode[]): boolean { return codes.some((c) => this.roleCodes().includes(c)); }
  hasPermission(code: string): boolean { return this._permissions().includes(code); }
  hasAnyPermission(codes: string[]): boolean { return codes.some((c) => this._permissions().includes(c)); }

  async initialize(): Promise<void> {
    this._loading.set(false);
  }

  async signIn(email: string, _password: string): Promise<{ error: string | null }> {
    const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { error: "No account found with that email address." };
    }

    const user: AppUser = {
      id: account.userId,
      email: account.email,
      first_name: account.firstName,
      last_name: account.lastName,
      phone: null,
      avatar_url: null,
      status: "active",
      last_login_at: new Date().toISOString(),
      is_active: true,
      created_at: "",
      updated_at: null,
      roles: account.roles,
    };

    this._user.set(user);
    this._roles.set(account.roles);
    this._permissions.set(account.permissions);
    return { error: null };
  }

  async signOut(): Promise<void> {
    this._user.set(null);
    this._roles.set([]);
    this._permissions.set([]);
  }

  async signUp(_email: string, _password: string, _firstName: string, _lastName: string): Promise<{ error: string | null; needsProfile: boolean }> {
    return { error: "Registration is disabled in demo mode. Use a demo account.", needsProfile: false };
  }

  async resetPassword(_email: string): Promise<{ error: string | null }> {
    return { error: null };
  }

  async updatePassword(_newPassword: string): Promise<{ error: string | null }> {
    return { error: null };
  }

  async loadUserProfile(_userId: string): Promise<void> {}

  async updateProfile(updates: Partial<AppUser>): Promise<{ error: string | null }> {
    const u = this._user();
    if (u) this._user.set({ ...u, ...updates });
    return { error: null };
  }
}

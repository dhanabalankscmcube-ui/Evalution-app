import { Routes } from "@angular/router";
import { authGuard, guestGuard, roleGuard } from "./core/auth/auth.guard";

export const routes: Routes = [
  {
    path: "auth",
    canActivate: [guestGuard],
    children: [
      { path: "login", loadComponent: () => import("./features/auth/login.component").then((m) => m.LoginComponent) },
      { path: "", redirectTo: "login", pathMatch: "full" },
    ],
  },
  {
    path: "app",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./shared/components/main-layout.component").then((m) => m.MainLayoutComponent),
    children: [
      { path: "dashboard", loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent) },

      // Employee (any authenticated user)
      { path: "profile", loadComponent: () => import("./features/profile/profile.component").then((m) => m.ProfileComponent) },
      {
        path: "my-evaluations",
        children: [
          { path: "", loadComponent: () => import("./features/evaluations/my-evaluation-list.component").then((m) => m.MyEvaluationListComponent) },
          { path: "new", loadComponent: () => import("./features/evaluations/start-evaluation.component").then((m) => m.StartEvaluationComponent) },
          { path: ":id", loadComponent: () => import("./features/evaluations/evaluation-form.component").then((m) => m.EvaluationFormComponent) },
          { path: ":id/edit", loadComponent: () => import("./features/evaluations/evaluation-form.component").then((m) => m.EvaluationFormComponent) },
        ],
      },
      { path: "goals", loadComponent: () => import("./features/employee/goals.component").then((m) => m.GoalsComponent) },
      { path: "review-history", loadComponent: () => import("./features/employee/review-history.component").then((m) => m.ReviewHistoryComponent) },

      // Manager
      {
        path: "team-reviews",
        canActivate: [roleGuard(["manager", "hr_admin"])],
        children: [
          { path: "", loadComponent: () => import("./features/manager/manager-review.component").then((m) => m.TeamReviewListComponent) },
          { path: ":id", loadComponent: () => import("./features/manager/manager-review.component").then((m) => m.ManagerReviewFormComponent) },
        ],
      },
      { path: "team-performance", loadComponent: () => import("./shared/components/placeholder.component").then((m) => m.PlaceholderComponent), data: { title: "Team Performance", subtitle: "Analyze your team's performance metrics", icon: "trending_up" } },
      { path: "approvals", loadComponent: () => import("./shared/components/placeholder.component").then((m) => m.PlaceholderComponent), data: { title: "Approvals", subtitle: "Review and approve pending requests", icon: "task_alt" } },

      // Administration (HR admin only)
      {
        path: "admin",
        canActivate: [roleGuard(["hr_admin"])],
        children: [
          {
            path: "departments",
            children: [
              { path: "", loadComponent: () => import("./features/admin/departments/department-list.component").then((m) => m.DepartmentListComponent) },
              { path: "new", loadComponent: () => import("./features/admin/departments/department-form.component").then((m) => m.DepartmentFormComponent) },
              { path: ":id", loadComponent: () => import("./features/admin/departments/department-form.component").then((m) => m.DepartmentFormComponent) },
            ],
          },
          {
            path: "designations",
            children: [
              { path: "", loadComponent: () => import("./features/admin/designations/designation.component").then((m) => m.DesignationListComponent) },
              { path: "new", loadComponent: () => import("./features/admin/designations/designation.component").then((m) => m.DesignationFormComponent) },
              { path: ":id", loadComponent: () => import("./features/admin/designations/designation.component").then((m) => m.DesignationFormComponent) },
            ],
          },
          {
            path: "review-periods",
            children: [
              { path: "", loadComponent: () => import("./features/admin/review-periods/review-period.component").then((m) => m.ReviewPeriodListComponent) },
              { path: "new", loadComponent: () => import("./features/admin/review-periods/review-period.component").then((m) => m.ReviewPeriodFormComponent) },
              { path: ":id", loadComponent: () => import("./features/admin/review-periods/review-period.component").then((m) => m.ReviewPeriodFormComponent) },
            ],
          },
          {
            path: "employees",
            children: [
              { path: "", loadComponent: () => import("./features/admin/employees/employee.component").then((m) => m.EmployeeListComponent) },
              { path: "new", loadComponent: () => import("./features/admin/employees/employee.component").then((m) => m.EmployeeFormComponent) },
              { path: ":id", loadComponent: () => import("./features/admin/employees/employee.component").then((m) => m.EmployeeFormComponent) },
            ],
          },
          {
            path: "templates",
            children: [
              { path: "", loadComponent: () => import("./features/admin/templates/template.component").then((m) => m.TemplateListComponent) },
              { path: "new", loadComponent: () => import("./features/admin/templates/template.component").then((m) => m.TemplateFormComponent) },
              { path: ":id", loadComponent: () => import("./features/admin/templates/template.component").then((m) => m.TemplateFormComponent) },
              { path: ":id/builder", loadComponent: () => import("./features/admin/templates/template-builder.component").then((m) => m.TemplateBuilderComponent) },
            ],
          },
          {
            path: "roles",
            children: [
              { path: "", loadComponent: () => import("./features/admin/roles/role.component").then((m) => m.RoleListComponent) },
              { path: "new", loadComponent: () => import("./features/admin/roles/role.component").then((m) => m.RoleFormComponent) },
              { path: ":id", loadComponent: () => import("./features/admin/roles/role.component").then((m) => m.RoleFormComponent) },
            ],
          },
          { path: "users", loadComponent: () => import("./features/admin/users/user.component").then((m) => m.UserListComponent) },
          { path: "managers", loadComponent: () => import("./features/admin/managers/manager-assignment.component").then((m) => m.ManagerAssignmentListComponent) },
          { path: "evaluations", loadComponent: () => import("./features/admin/evaluations/all-evaluations.component").then((m) => m.AllEvaluationsComponent) },
          { path: "evaluations/:id", loadComponent: () => import("./features/evaluations/evaluation-form.component").then((m) => m.EvaluationFormComponent) },
        ],
      },

      // Reports (manager and HR)
      { path: "reports", loadComponent: () => import("./features/reports/reports.component").then((m) => m.ReportsComponent) },
      { path: "settings", loadComponent: () => import("./shared/components/placeholder.component").then((m) => m.PlaceholderComponent), data: { title: "Settings", subtitle: "Configure your application preferences", icon: "settings" } },
      { path: "help", loadComponent: () => import("./shared/components/placeholder.component").then((m) => m.PlaceholderComponent), data: { title: "Help & Support", subtitle: "Find answers and contact support", icon: "help" } },

      { path: "access-denied", loadComponent: () => import("./features/access-denied.component").then((m) => m.AccessDeniedComponent) },
    ],
  },
  { path: "", redirectTo: "/auth/login", pathMatch: "full" },
  { path: "**", redirectTo: "/auth/login" },
];

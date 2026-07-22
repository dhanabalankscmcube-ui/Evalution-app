import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-access-denied",
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <mat-icon class="text-6xl text-slate-300">lock</mat-icon>
      <h1 class="text-2xl font-bold text-slate-900 mt-4">Access Denied</h1>
      <p class="text-sm text-slate-500 mt-2 max-w-md">
        You don't have permission to access this page. Please contact your administrator
        if you believe this is an error.
      </p>
      <button mat-flat-button color="primary" routerLink="/app/dashboard" class="mt-6">
        <mat-icon>home</mat-icon> Go to Dashboard
      </button>
    </div>
  `,
})
export class AccessDeniedComponent {}

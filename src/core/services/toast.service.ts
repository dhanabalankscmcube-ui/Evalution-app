import { Injectable, inject } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";

export type ToastType = "success" | "error" | "info" | "warning";

@Injectable({ providedIn: "root" })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  show(message: string, type: ToastType = "info", duration = 4000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: [`toast-${type}`],
    };
    this.snackBar.open(message, "Dismiss", config);
  }

  success(message: string, duration?: number): void {
    this.show(message, "success", duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, "error", duration ?? 6000);
  }

  info(message: string, duration?: number): void {
    this.show(message, "info", duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, "warning", duration);
  }
}

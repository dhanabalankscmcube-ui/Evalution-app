import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-loading-overlay",
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loading) {
      <div class="loading-overlay">
        <div class="loading-overlay__card">
          <mat-progress-spinner diameter="36" mode="indeterminate" />
          <span class="loading-overlay__text">Loading…</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      border-radius: inherit;
      backdrop-filter: blur(4px);
    }
    .loading-overlay__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .loading-overlay__text {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-muted);
    }
  `],
})
export class LoadingOverlayComponent {
  @Input() loading = false;
}

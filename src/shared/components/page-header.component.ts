import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { BreadcrumbComponent, BreadcrumbItem } from "./breadcrumb.component";

@Component({
  selector: "app-page-header",
  standalone: true,
  imports: [CommonModule, MatIconModule, BreadcrumbComponent],
  template: `
    <div class="page-header">
      @if (breadcrumbs.length > 0) {
        <app-breadcrumb [items]="breadcrumbs" />
      }
      <div class="page-header__row">
        <div class="page-header__content">
          <h1 class="page-header__title">{{ title }}</h1>
          @if (subtitle) {
            <p class="page-header__subtitle">{{ subtitle }}</p>
          }
        </div>
        @if (hasActions) {
          <div class="page-header__actions">
            <ng-content></ng-content>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-top: 8px;
    }
    .page-header__content { min-width: 0; }
    .page-header__title {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1.2;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .page-header__subtitle {
      font-size: 14px;
      color: var(--color-text-muted);
      margin-top: 4px;
    }
    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    @media (max-width: 640px) {
      .page-header__row { flex-direction: column; }
      .page-header__actions { width: 100%; }
    }
  `],
})
export class PageHeaderComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() hasActions = false;
  @Input() actions: boolean = false;
}

export type { BreadcrumbItem };

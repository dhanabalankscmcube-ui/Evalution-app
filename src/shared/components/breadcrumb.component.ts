import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: "app-breadcrumb",
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <nav class="breadcrumb">
      @for (crumb of items; track crumb.label; let last = $last) {
        @if (crumb.url && !last) {
          <a [routerLink]="crumb.url" class="breadcrumb__link">{{ crumb.label }}</a>
        } @else {
          <span class="breadcrumb__current">{{ crumb.label }}</span>
        }
        @if (!last) {
          <mat-icon class="breadcrumb__sep">chevron_right</mat-icon>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
    }
    .breadcrumb__link {
      color: #64748b;
      text-decoration: none;
      transition: color 200ms ease;
    }
    .breadcrumb__link:hover { color: #2563eb; }
    .breadcrumb__current {
      color: #1e293b;
      font-weight: 600;
    }
    .breadcrumb__sep {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #cbd5e1;
    }
  `],
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}

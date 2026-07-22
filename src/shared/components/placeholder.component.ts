import { Component, Input, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { PageHeaderComponent } from "../../shared/components/page-header.component";
import { BreadcrumbItem } from "../../shared/components/breadcrumb.component";

@Component({
  selector: "app-placeholder",
  standalone: true,
  imports: [CommonModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header [title]="title" [subtitle]="subtitle" [breadcrumbs]="breadcrumbs" />

    <div class="card card-body placeholder">
      <div class="placeholder__icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h2 class="placeholder__title">{{ title }}</h2>
      <p class="placeholder__text">
        This module is part of the HR Performance Hub enterprise application shell.
        The full feature will be available in the next release.
      </p>
      <div class="placeholder__tags">
        <span class="chip chip-primary">{{ title }}</span>
        <span class="chip">Enterprise</span>
        <span class="chip">HR Module</span>
      </div>
    </div>
  `,
  styles: [`
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 24px;
    }
    .placeholder__icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: #dbeafe; color: #2563eb;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .placeholder__icon mat-icon { font-size: 36px !important; width: 36px !important; height: 36px !important; }
    .placeholder__title {
      font-size: 20px; font-weight: 600; color: var(--color-text); margin: 0 0 8px;
    }
    .placeholder__text {
      font-size: 14px; color: var(--color-text-muted); max-width: 420px; line-height: 1.6;
    }
    .placeholder__tags {
      display: flex; gap: 8px; margin-top: 20px;
    }
  `],
})
export class PlaceholderComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() icon = "construction";
  @Input() breadcrumbs: BreadcrumbItem[] = [];

  private route = inject(ActivatedRoute);

  constructor() {
    const data = this.route.snapshot.data;
    if (data["title"]) this.title = data["title"];
    if (data["subtitle"]) this.subtitle = data["subtitle"];
    if (data["icon"]) this.icon = data["icon"];
  }
}

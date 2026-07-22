import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

export type CardColor = "primary" | "success" | "warning" | "danger" | "neutral";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="stat-card" [class]="'stat-card--' + color">
      <div class="stat-card__icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="stat-card__body">
        <div class="stat-card__value">{{ value }}</div>
        <div class="stat-card__label">{{ label }}</div>
        @if (trend) {
          <div class="stat-card__trend" [class]="trendPositive ? 'stat-card__trend--up' : 'stat-card__trend--down'">
            <mat-icon>{{ trendPositive ? 'trending_up' : 'trending_down' }}</mat-icon>
            <span>{{ trend }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: box-shadow 200ms ease, transform 200ms ease;
    }
    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .stat-card__icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-card__icon mat-icon { font-size: 24px !important; width: 24px !important; height: 24px !important; }

    .stat-card--primary .stat-card__icon { background: #dbeafe; color: #2563eb; }
    .stat-card--success .stat-card__icon { background: #dcfce7; color: #16a34a; }
    .stat-card--warning .stat-card__icon { background: #fef3c7; color: #d97706; }
    .stat-card--danger  .stat-card__icon { background: #fee2e2; color: #dc2626; }
    .stat-card--neutral .stat-card__icon { background: #f1f5f9; color: #64748b; }

    .stat-card__body { min-width: 0; }
    .stat-card__value {
      font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1.1;
    }
    .stat-card__label {
      font-size: 13px; color: #64748b; margin-top: 2px;
    }
    .stat-card__trend {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; margin-top: 8px;
    }
    .stat-card__trend mat-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .stat-card__trend--up { color: #16a34a; }
    .stat-card__trend--down { color: #dc2626; }
  `],
})
export class StatCardComponent {
  @Input() icon = "analytics";
  @Input() value: string | number = 0;
  @Input() label = "";
  @Input() color: CardColor = "primary";
  @Input() trend = "";
  @Input() trendPositive = true;
}

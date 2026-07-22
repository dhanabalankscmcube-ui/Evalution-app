import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { EvaluationStatus } from "../../core/models";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  resubmitted: "Resubmitted",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
};

const STATUS_CLASSES: Record<string, string> = {
  draft: "badge-draft",
  submitted: "badge-submitted",
  in_review: "badge-in-review",
  changes_requested: "badge-changes-requested",
  resubmitted: "badge-resubmitted",
  approved: "badge-approved",
  rejected: "badge-rejected",
  completed: "badge-completed",
};

@Component({
  selector: "app-status-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge {{ badgeClass }}">{{ label }}</span>
  `,
})
export class StatusBadgeComponent {
  @Input() set status(value: EvaluationStatus | string) {
    this._status = value;
    this.label = STATUS_LABELS[value] ?? value;
    this.badgeClass = STATUS_CLASSES[value] ?? "badge-draft";
  }
  get status(): EvaluationStatus | string {
    return this._status;
  }

  private _status = "draft";
  label = "Draft";
  badgeClass = "badge-draft";
}

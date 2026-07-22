import { Component, inject, signal, ViewChild, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { PageHeaderComponent } from "../components/page-header.component";
import { DataTableComponent, TableColumn } from "../components/data-table.component";
import { ConfirmDialogComponent } from "../components/confirm-dialog.component";
import { ToastService } from "../core/services/toast.service";
import type { QueryParams, PaginatedResult } from "../core/models";

export abstract class CrudListConfig<T extends { id: string }> {
  abstract title: string;
  abstract subtitle: string;
  abstract columns: TableColumn[];
  abstract searchPlaceholder: string;
  abstract loadFn: (params: QueryParams) => Promise<PaginatedResult<T>>;
  abstract deleteFn: (id: string) => Promise<void>;
  abstract editRoute: string;
  abstract createRoute?: string;
  abstract breadcrumbs: any[];
  rowClickEnabled = true;
}

@Component({
  selector: "app-crud-list-page",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    PageHeaderComponent,
    DataTableComponent,
  ],
  template: `
    <app-page-header
      [title]="config.title"
      [subtitle]="config.subtitle"
      [breadcrumbs]="config.breadcrumbs"
      [actions]="!!config.createRoute"
    >
      @if (config.createRoute) {
        <button mat-flat-button color="primary" (click)="create()">
          <mat-icon>add</mat-icon>
          Add New
        </button>
      }
    </app-page-header>

    <div class="mb-4">
      <mat-form-field appearance="outline" class="w-full max-w-md">
        <mat-label>{{ config.searchPlaceholder }}</mat-label>
        <input matInput [value]="search()" (input)="onSearch($event)" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    <app-data-table
      [columns]="config.columns"
      [data]="data()"
      [loading]="loading()"
      [total]="total()"
      [pageSize]="pageSize"
      [pageIndex]="pageIndex"
      [rowClickEnabled]="config.rowClickEnabled"
      (pageChange)="onPageChange($event)"
      (rowClick)="onRowClick($event)"
    />
  `,
})
export class CrudListPageComponent<T extends { id: string }> {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);

  @ViewChild('rowTemplate') rowTemplate!: TemplateRef<any>;

  config!: CrudListConfig<T>;

  data = signal<T[]>([]);
  loading = signal(false);
  total = signal(0);
  search = signal("");
  pageIndex = 0;
  pageSize = 10;
  private searchTimeout: any;

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const params: QueryParams = {
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        search: this.search() || undefined,
      };
      const result = await this.config.loadFn(params);
      this.data.set(result.data);
      this.total.set(result.count);
    } catch (err: any) {
      this.toast.error(err.message ?? "Failed to load data");
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pageIndex = 0;
      this.load();
    }, 300);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  onRowClick(row: T): void {
    if (this.config.editRoute) {
      this.router.navigate([this.config.editRoute, row.id]);
    }
  }

  create(): void {
    if (this.config.createRoute) {
      this.router.navigate([this.config.createRoute]);
    }
  }
}

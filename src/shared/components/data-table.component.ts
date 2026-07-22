import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatPaginatorModule, MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: "app-data-table",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      @if (loading) {
        <div class="flex items-center justify-center py-20">
          <mat-progress-spinner diameter="40" mode="indeterminate" />
        </div>
      } @else if (dataSource.data.length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p class="text-sm">{{ emptyMessage }}</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            @for (col of columns; track col.key) {
              <ng-container [matColumnDef]="col.key">
                <th mat-header-cell *matHeaderCellDef
                  [mat-sort-header]="col.sortable !== false"
                  class="px-4 py-3 text-left">
                  {{ col.label }}
                </th>
                <td mat-cell *matCellDef="let row" class="px-4 py-3">
                  <ng-container
                    [ngTemplateOutlet]="getCellTemplate(col.key)"
                    [ngTemplateOutletContext]="{ $implicit: row }"
                  ></ng-container>
                </td>
              </ng-container>
            }
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"
              class="hover:bg-slate-50 transition-colors cursor-pointer"
              (click)="onRowClick(row)"></tr>
          </table>
        </div>
        @if (showPaginator) {
          <mat-paginator
            [length]="total"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            class="border-t border-slate-100"
          ></mat-paginator>
        }
      }
    </div>
  `,
})
export class DataTableComponent<T = any> {
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;
  @Input() emptyMessage = "No records found.";
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() showPaginator = true;
  @Input() rowClickEnabled = false;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() rowClick = new EventEmitter<T>();

  @Input() set data(items: T[]) {
    this.dataSource.data = items ?? [];
  }

  @Input() cellTemplates: Record<string, any> = {};

  dataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges() {
    this.displayedColumns = this.columns.map((c) => c.key);
  }

  getCellTemplate(key: string): any {
    return this.cellTemplates[key];
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onRowClick(row: T): void {
    if (this.rowClickEnabled) {
      this.rowClick.emit(row);
    }
  }
}

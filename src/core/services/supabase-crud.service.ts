// This service is no longer used — all domain services use mock data.
// Kept for backward compatibility.
import { Injectable } from "@angular/core";
import type { QueryParams, PaginatedResult } from "../models";

@Injectable({ providedIn: "root" })
export class SupabaseCrudService {
  async getAll<T>(table: string, select: string, params: QueryParams = {}): Promise<PaginatedResult<T>> {
    return { data: [], count: 0, page: 1, pageSize: 10 };
  }
  async getById<T>(table: string, select: string, id: string): Promise<T | null> { return null; }
  async create<T>(table: string, payload: any): Promise<T> { return {} as T; }
  async update<T>(table: string, id: string, payload: any): Promise<T> { return {} as T; }
  async softDelete(table: string, id: string): Promise<void> {}
  async restore(table: string, id: string): Promise<void> {}
  async setActive(table: string, id: string, isActive: boolean): Promise<void> {}
}

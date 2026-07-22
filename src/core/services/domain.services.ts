import { Injectable, inject } from "@angular/core";
import type {
  Department, Designation, Employee, ReviewPeriod, EvaluationTemplate,
  EvaluationSection, EvaluationQuestion, EmployeeEvaluation, EmployeeRating,
  ManagerReview, ManagerRating, ManagerAssignment, Role, AppUser, QueryParams, PaginatedResult,
} from "../models";
import {
  MOCK_DEPARTMENTS, MOCK_DESIGNATIONS, MOCK_EMPLOYEES, MOCK_REVIEW_PERIODS,
  MOCK_TEMPLATES, MOCK_SECTIONS, MOCK_QUESTIONS, MOCK_EVALUATIONS,
  MOCK_MANAGER_ASSIGNMENTS, MOCK_ROLES, MOCK_USERS,
} from "./mock-data";

function paginate<T>(items: T[], params: QueryParams): PaginatedResult<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  let filtered = [...items];

  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter((item: any) =>
      Object.values(item).some((v) => v != null && String(v).toLowerCase().includes(s))
    );
  }
  if (params.sortBy) {
    filtered.sort((a: any, b: any) => {
      const av = a[params.sortBy!];
      const bv = b[params.sortBy!];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv));
      return params.sortDir === "desc" ? -cmp : cmp;
    });
  }
  return { data: filtered.slice(start, start + pageSize), count: filtered.length, page, pageSize };
}

@Injectable({ providedIn: "root" })
export class DepartmentService {
  private items = [...MOCK_DEPARTMENTS];
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getAllActive() { return this.items.filter((d) => d.is_active); }
  async getById(id: string) { return this.items.find((d) => d.id === id) ?? null; }
  async create(payload: Partial<Department>) {
    const item = { ...payload, id: `dept-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null } as Department;
    this.items.push(item); return item;
  }
  async update(id: string, payload: Partial<Department>) {
    const idx = this.items.findIndex((d) => d.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((d) => d.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
}

@Injectable({ providedIn: "root" })
export class DesignationService {
  private items = [...MOCK_DESIGNATIONS];
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getAllActive() { return this.items.filter((d) => d.is_active); }
  async getById(id: string) { return this.items.find((d) => d.id === id) ?? null; }
  async create(payload: Partial<Designation>) {
    const item = { ...payload, id: `desig-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null } as Designation;
    this.items.push(item); return item;
  }
  async update(id: string, payload: Partial<Designation>) {
    const idx = this.items.findIndex((d) => d.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((d) => d.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
}

@Injectable({ providedIn: "root" })
export class EmployeeService {
  private items = [...MOCK_EMPLOYEES];
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getById(id: string) { return this.items.find((e) => e.id === id) ?? null; }
  async getByUserId(userId: string) { return this.items.find((e) => e.user_id === userId) ?? null; }
  async getTeamMembers(managerId: string) { return this.items.filter((e) => e.manager_id === managerId); }
  async create(payload: Partial<Employee>) {
    const item = { ...payload, id: `emp-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null } as Employee;
    this.items.push(item); return item;
  }
  async update(id: string, payload: Partial<Employee>) {
    const idx = this.items.findIndex((e) => e.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((e) => e.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
}

@Injectable({ providedIn: "root" })
export class ManagerService {
  private items = [...MOCK_MANAGER_ASSIGNMENTS];
  async getAll() { return this.items; }
  async assign(payload: Partial<ManagerAssignment>) {
    const item = { ...payload, id: `mgr-${Date.now()}`, is_active: true } as ManagerAssignment;
    this.items.push(item); return item;
  }
  async remove(id: string) {
    const idx = this.items.findIndex((m) => m.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
}

@Injectable({ providedIn: "root" })
export class ReviewPeriodService {
  private items = [...MOCK_REVIEW_PERIODS];
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getAllActive() { return this.items.filter((p) => p.is_active); }
  async getById(id: string) { return this.items.find((p) => p.id === id) ?? null; }
  async create(payload: Partial<ReviewPeriod>) {
    const item = { ...payload, id: `period-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null } as ReviewPeriod;
    this.items.push(item); return item;
  }
  async update(id: string, payload: Partial<ReviewPeriod>) {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
}

@Injectable({ providedIn: "root" })
export class EvaluationTemplateService {
  private items = [...MOCK_TEMPLATES];
  private sections = [...MOCK_SECTIONS];
  private questions = [...MOCK_QUESTIONS];
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getAllActive() { return this.items.filter((t) => t.is_active); }
  async getById(id: string) {
    const tmpl = this.items.find((t) => t.id === id);
    if (!tmpl) return null;
    return { ...tmpl, sections: this.sections.filter((s) => s.template_id === id).map((s) => ({ ...s, questions: this.questions.filter((q) => q.section_id === s.id) })) };
  }
  async create(payload: Partial<EvaluationTemplate>) {
    const item = { ...payload, id: `tmpl-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null, version: 1 } as EvaluationTemplate;
    this.items.push(item); return item;
  }
  async update(id: string, payload: Partial<EvaluationTemplate>) {
    const idx = this.items.findIndex((t) => t.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((t) => t.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
  async addSection(payload: Partial<EvaluationSection>) {
    const item = { ...payload, id: `sec-${Date.now()}`, is_active: true } as EvaluationSection;
    this.sections.push(item); return item;
  }
  async updateSection(id: string, payload: Partial<EvaluationSection>) {
    const idx = this.sections.findIndex((s) => s.id === id);
    if (idx >= 0) this.sections[idx] = { ...this.sections[idx], ...payload };
  }
  async deleteSection(id: string) {
    this.sections = this.sections.filter((s) => s.id !== id);
  }
  async addQuestion(payload: Partial<EvaluationQuestion>) {
    const item = { ...payload, id: `q-${Date.now()}`, is_active: true } as EvaluationQuestion;
    this.questions.push(item); return item;
  }
  async updateQuestion(id: string, payload: Partial<EvaluationQuestion>) {
    const idx = this.questions.findIndex((q) => q.id === id);
    if (idx >= 0) this.questions[idx] = { ...this.questions[idx], ...payload };
  }
  async deleteQuestion(id: string) {
    this.questions = this.questions.filter((q) => q.id !== id);
  }
}

@Injectable({ providedIn: "root" })
export class EvaluationService {
  private items = [...MOCK_EVALUATIONS];
  async getMyEvaluations(employeeId: string) { return this.items.filter((e) => e.employee_id === employeeId); }
  async getAllEvaluations(params: QueryParams = {}) {
    let filtered = [...this.items];
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((e: any) => Object.values(e).some((v) => v != null && String(v).toLowerCase().includes(s)));
    }
    if (params.filters?.["status"]) { filtered = filtered.filter((e) => e.status === params.filters!["status"]); }
    return filtered;
  }
  async getById(id: string) {
    const ev = this.items.find((e) => e.id === id);
    if (!ev) return null;
    const tmpl = await new EvaluationTemplateService().getById(ev.template_id);
    return { ...ev, template: tmpl ?? ev.template };
  }
  async create(payload: Partial<EmployeeEvaluation>) {
    const item = { ...payload, id: `eval-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null, ratings: [] } as EmployeeEvaluation;
    this.items.push(item); return item;
  }
  async updateStatus(id: string, status: string, extra?: Partial<EmployeeEvaluation>) {
    const idx = this.items.findIndex((e) => e.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], status: status as any, ...extra };
  }
  async updateComment(id: string, comment: string) {
    const idx = this.items.findIndex((e) => e.id === id);
    if (idx >= 0) this.items[idx].employee_comment = comment;
  }
  async saveRatings(evaluationId: string, ratings: Partial<EmployeeRating>[]) {
    const ev = this.items.find((e) => e.id === evaluationId);
    if (!ev) return;
    if (!ev.ratings) ev.ratings = [];
    for (const r of ratings) {
      const existing = ev.ratings.find((er) => er.question_id === r.question_id);
      if (existing) { Object.assign(existing, r); }
      else { ev.ratings.push({ ...r, id: `r-${Date.now()}`, evaluation_id: evaluationId } as EmployeeRating); }
    }
  }
  async getRatings(evaluationId: string) {
    const ev = this.items.find((e) => e.id === evaluationId);
    return ev?.ratings ?? [];
  }
}

@Injectable({ providedIn: "root" })
export class ManagerReviewService {
  private reviews: ManagerReview[] = [];

  async getByEvaluationId(evaluationId: string) {
    const existing = this.reviews.find((r) => r.evaluation_id === evaluationId);
    if (existing) return existing;
    const ev = MOCK_EVALUATIONS.find((e) => e.id === evaluationId);
    return ev?.manager_review ?? null;
  }

  async create(payload: Partial<ManagerReview>) {
    const item = {
      ...payload,
      id: `mrev-${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: null,
      ratings: [],
    } as ManagerReview;
    this.reviews.push(item);
    return item;
  }

  async update(id: string, payload: Partial<ManagerReview>) {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.reviews[idx] = { ...this.reviews[idx], ...payload };
    }
  }

  async saveRatings(reviewId: string, ratings: Partial<ManagerRating>[]) {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) return;
    if (!review.ratings) review.ratings = [];
    for (const r of ratings) {
      const existing = review.ratings.find((er) => er.question_id === r.question_id);
      if (existing) {
        Object.assign(existing, r);
      } else {
        review.ratings.push({
          ...r,
          id: `mr-${Date.now()}`,
          manager_review_id: reviewId,
        } as ManagerRating);
      }
    }
  }
}

@Injectable({ providedIn: "root" })
export class RoleService {
  private items = [...MOCK_ROLES];
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getAllActive() { return this.items.filter((r) => r.is_active); }
  async getById(id: string) { return this.items.find((r) => r.id === id) ?? null; }
  async create(payload: Partial<Role>) {
    const item = { ...payload, id: `role-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), updated_at: null } as Role;
    this.items.push(item); return item;
  }
  async update(id: string, payload: Partial<Role>) {
    const idx = this.items.findIndex((r) => r.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((r) => r.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
  async assignToUser(_userId: string, _roleId: string) {}
  async removeFromUser(_userId: string, _roleId: string) {}
}

@Injectable({ providedIn: "root" })
export class UserService {
  private items = MOCK_USERS.map((u) => ({ ...u, user_roles: [] as any[] }));
  async getAll(params: QueryParams = {}) { return paginate(this.items, params); }
  async getById(id: string) { return this.items.find((u) => u.id === id) ?? null; }
  async update(id: string, payload: Partial<AppUser>) {
    const idx = this.items.findIndex((u) => u.id === id);
    if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload };
    return this.items[idx];
  }
  async delete(id: string) {
    const idx = this.items.findIndex((u) => u.id === id);
    if (idx >= 0) { this.items[idx].is_active = false; }
  }
}

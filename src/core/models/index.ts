export type EvaluationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "completed";

export type QuestionType =
  | "rating"
  | "text"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "date";

export type RoleCode = "employee" | "manager" | "hr_admin";

export interface Role {
  id: string;
  name: string;
  code: RoleCode;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string | null;
  description: string | null;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

export interface AppUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  last_login_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  roles?: Role[];
}

export interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Designation {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  designation_id: string | null;
  manager_id: string | null;
  hire_date: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  department?: Department | null;
  designation?: Designation | null;
  manager?: Employee | null;
  user?: AppUser | null;
}

export interface ManagerAssignment {
  id: string;
  employee_id: string;
  department_id: string;
  is_primary: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  employee?: Employee;
  department?: Department;
}

export interface ReviewPeriod {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  review_period_id: string | null;
  status: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  sections?: EvaluationSection[];
  review_period?: ReviewPeriod | null;
}

export interface EvaluationSection {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  questions?: EvaluationQuestion[];
}

export interface EvaluationQuestion {
  id: string;
  section_id: string;
  text: string;
  description: string | null;
  question_type: QuestionType;
  display_order: number;
  is_required: boolean;
  options: string[] | null;
  min_rating: number | null;
  max_rating: number | null;
  weight: number | null;
  is_active: boolean;
}

export interface EmployeeEvaluation {
  id: string;
  employee_id: string;
  review_period_id: string;
  template_id: string;
  status: EvaluationStatus;
  employee_comment: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  overall_score: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  employee?: Employee;
  review_period?: ReviewPeriod;
  template?: EvaluationTemplate;
  ratings?: EmployeeRating[];
  manager_review?: ManagerReview | null;
}

export interface EmployeeRating {
  id: string;
  evaluation_id: string;
  question_id: string;
  rating_value: number | null;
  text_value: string | null;
  selected_options: string[] | null;
  date_value: string | null;
  comment: string | null;
  question?: EvaluationQuestion;
}

export interface ManagerReview {
  id: string;
  evaluation_id: string;
  manager_id: string;
  status: EvaluationStatus;
  overall_comment: string | null;
  overall_score: number | null;
  reviewed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  manager?: Employee;
  ratings?: ManagerRating[];
}

export interface ManagerRating {
  id: string;
  manager_review_id: string;
  question_id: string;
  rating_value: number | null;
  comment: string | null;
  question?: EvaluationQuestion;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string>;
}

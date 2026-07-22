import type {
  Department,
  Designation,
  Employee,
  ReviewPeriod,
  EvaluationTemplate,
  EvaluationSection,
  EvaluationQuestion,
  EmployeeEvaluation,
  EmployeeRating,
  ManagerReview,
  ManagerRating,
  Role,
  AppUser,
  Permission,
  ManagerAssignment,
} from "../models";

export const MOCK_ROLES: Role[] = [
  { id: "role-1", name: "Employee", code: "employee", description: "Standard employee who can perform self-evaluations", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "role-2", name: "Manager", code: "manager", description: "People manager who reviews team evaluations", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "role-3", name: "HR Administrator", code: "hr_admin", description: "HR administrator with full management access", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
];

export const MOCK_PERMISSIONS: Permission[] = [
  { id: "p1", name: "View Own Profile", code: "employee.profile.view", module: "Employee", description: "" },
  { id: "p2", name: "Update Own Profile", code: "employee.profile.update", module: "Employee", description: "" },
  { id: "p3", name: "Start Evaluation", code: "employee.eval.start", module: "Employee", description: "" },
  { id: "p4", name: "Save Draft", code: "employee.eval.draft", module: "Employee", description: "" },
  { id: "p5", name: "Submit Evaluation", code: "employee.eval.submit", module: "Employee", description: "" },
  { id: "p6", name: "View Own Evaluations", code: "employee.eval.view", module: "Employee", description: "" },
  { id: "p7", name: "View Team Members", code: "manager.team.view", module: "Manager", description: "" },
  { id: "p8", name: "Review Evaluation", code: "manager.review.view", module: "Manager", description: "" },
  { id: "p9", name: "Rate Sections", code: "manager.review.rate", module: "Manager", description: "" },
  { id: "p10", name: "Approve Evaluation", code: "manager.review.approve", module: "Manager", description: "" },
  { id: "p11", name: "Reject Evaluation", code: "manager.review.reject", module: "Manager", description: "" },
  { id: "p12", name: "Request Changes", code: "manager.review.changes", module: "Manager", description: "" },
  { id: "p13", name: "Manage Employees", code: "hr.employees.manage", module: "HR", description: "" },
  { id: "p14", name: "Manage Departments", code: "hr.departments.manage", module: "HR", description: "" },
  { id: "p15", name: "Manage Designations", code: "hr.designations.manage", module: "HR", description: "" },
  { id: "p16", name: "Manage Roles", code: "hr.roles.manage", module: "HR", description: "" },
  { id: "p17", name: "Manage Templates", code: "hr.templates.manage", module: "HR", description: "" },
  { id: "p18", name: "Manage Review Periods", code: "hr.periods.manage", module: "HR", description: "" },
  { id: "p19", name: "Assign Managers", code: "hr.managers.assign", module: "HR", description: "" },
  { id: "p20", name: "View All Evaluations", code: "hr.evaluations.view", module: "HR", description: "" },
  { id: "p21", name: "Manage Users", code: "hr.users.manage", module: "HR", description: "" },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Engineering", code: "ENG", description: "Software engineering and development", parent_id: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "dept-2", name: "Product", code: "PROD", description: "Product management and design", parent_id: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "dept-3", name: "Human Resources", code: "HR", description: "Human resources and people operations", parent_id: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "dept-4", name: "Sales", code: "SAL", description: "Sales and business development", parent_id: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
];

export const MOCK_DESIGNATIONS: Designation[] = [
  { id: "desig-1", name: "Software Engineer", code: "SE", description: "Software engineer", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "desig-2", name: "Senior Software Engineer", code: "SSE", description: "Senior software engineer", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "desig-3", name: "Engineering Manager", code: "EM", description: "Engineering team manager", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "desig-4", name: "Product Manager", code: "PM", description: "Product manager", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "desig-5", name: "HR Specialist", code: "HRS", description: "HR specialist", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "desig-6", name: "Sales Representative", code: "SR", description: "Sales representative", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
];

export const MOCK_USERS: AppUser[] = [
  { id: "user-1", email: "john.doe@company.com", first_name: "John", last_name: "Doe", phone: "+1-555-0100", avatar_url: null, status: "active", last_login_at: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "user-2", email: "jane.smith@company.com", first_name: "Jane", last_name: "Smith", phone: "+1-555-0101", avatar_url: null, status: "active", last_login_at: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "user-3", email: "mike.johnson@company.com", first_name: "Mike", last_name: "Johnson", phone: "+1-555-0102", avatar_url: null, status: "active", last_login_at: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "user-4", email: "sarah.williams@company.com", first_name: "Sarah", last_name: "Williams", phone: "+1-555-0103", avatar_url: null, status: "active", last_login_at: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "user-5", email: "tom.brown@company.com", first_name: "Tom", last_name: "Brown", phone: "+1-555-0104", avatar_url: null, status: "active", last_login_at: null, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-1", user_id: "user-1", employee_number: "EMP-001", first_name: "John", last_name: "Doe",
    email: "john.doe@company.com", phone: "+1-555-0100", department_id: "dept-1", designation_id: "desig-2",
    manager_id: "emp-2", hire_date: "2023-03-15", status: "active", is_active: true,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
    department: MOCK_DEPARTMENTS[0], designation: MOCK_DESIGNATIONS[1],
    manager: null, user: MOCK_USERS[0],
  },
  {
    id: "emp-2", user_id: "user-2", employee_number: "EMP-002", first_name: "Jane", last_name: "Smith",
    email: "jane.smith@company.com", phone: "+1-555-0101", department_id: "dept-1", designation_id: "desig-3",
    manager_id: null, hire_date: "2021-06-01", status: "active", is_active: true,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
    department: MOCK_DEPARTMENTS[0], designation: MOCK_DESIGNATIONS[2],
    manager: null, user: MOCK_USERS[1],
  },
  {
    id: "emp-3", user_id: "user-3", employee_number: "EMP-003", first_name: "Mike", last_name: "Johnson",
    email: "mike.johnson@company.com", phone: "+1-555-0102", department_id: "dept-1", designation_id: "desig-1",
    manager_id: "emp-2", hire_date: "2024-01-10", status: "active", is_active: true,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
    department: MOCK_DEPARTMENTS[0], designation: MOCK_DESIGNATIONS[0],
    manager: null, user: MOCK_USERS[2],
  },
  {
    id: "emp-4", user_id: "user-4", employee_number: "EMP-004", first_name: "Sarah", last_name: "Williams",
    email: "sarah.williams@company.com", phone: "+1-555-0103", department_id: "dept-2", designation_id: "desig-4",
    manager_id: null, hire_date: "2022-09-15", status: "active", is_active: true,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
    department: MOCK_DEPARTMENTS[1], designation: MOCK_DESIGNATIONS[3],
    manager: null, user: MOCK_USERS[3],
  },
  {
    id: "emp-5", user_id: "user-5", employee_number: "EMP-005", first_name: "Tom", last_name: "Brown",
    email: "tom.brown@company.com", phone: "+1-555-0104", department_id: "dept-3", designation_id: "desig-5",
    manager_id: null, hire_date: "2023-11-01", status: "active", is_active: true,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
    department: MOCK_DEPARTMENTS[2], designation: MOCK_DESIGNATIONS[4],
    manager: null, user: MOCK_USERS[4],
  },
];

// Fix manager references
MOCK_EMPLOYEES[0].manager = MOCK_EMPLOYEES[1];
MOCK_EMPLOYEES[2].manager = MOCK_EMPLOYEES[1];

export const MOCK_MANAGER_ASSIGNMENTS: ManagerAssignment[] = [
  { id: "mgr-1", employee_id: "emp-2", department_id: "dept-1", is_primary: true, start_date: "2021-06-01", end_date: null, is_active: true, employee: MOCK_EMPLOYEES[1], department: MOCK_DEPARTMENTS[0] },
  { id: "mgr-2", employee_id: "emp-4", department_id: "dept-2", is_primary: true, start_date: "2022-09-15", end_date: null, is_active: true, employee: MOCK_EMPLOYEES[3], department: MOCK_DEPARTMENTS[1] },
];

export const MOCK_REVIEW_PERIODS: ReviewPeriod[] = [
  { id: "period-1", name: "Q1 2026 Performance Review", code: "Q1-2026", description: "First quarter 2026 performance evaluation cycle", start_date: "2026-01-01", end_date: "2026-03-31", status: "active", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
  { id: "period-2", name: "Q2 2026 Performance Review", code: "Q2-2026", description: "Second quarter 2026 performance evaluation cycle", start_date: "2026-04-01", end_date: "2026-06-30", status: "draft", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: null },
];

export const MOCK_QUESTIONS: EvaluationQuestion[] = [
  { id: "q1", section_id: "sec-1", text: "Rate your overall achievement of quarterly goals", description: "1 = Far below expectations, 5 = Exceeded expectations", question_type: "rating", display_order: 1, is_required: true, options: null, min_rating: 1, max_rating: 5, weight: 1.0, is_active: true },
  { id: "q2", section_id: "sec-1", text: "List your top 3 achievements this quarter", description: "Provide specific examples with measurable outcomes", question_type: "textarea", display_order: 2, is_required: true, options: null, min_rating: null, max_rating: null, weight: null, is_active: true },
  { id: "q3", section_id: "sec-2", text: "Communication skills", description: "Rate effectiveness of written and verbal communication", question_type: "rating", display_order: 1, is_required: true, options: null, min_rating: 1, max_rating: 5, weight: 1.0, is_active: true },
  { id: "q4", section_id: "sec-2", text: "Teamwork & collaboration", description: "Ability to work effectively within a team", question_type: "rating", display_order: 2, is_required: true, options: null, min_rating: 1, max_rating: 5, weight: 1.0, is_active: true },
  { id: "q5", section_id: "sec-2", text: "Which areas need the most improvement?", description: "Select all that apply", question_type: "checkbox", display_order: 3, is_required: true, options: ["Technical skills", "Communication", "Time management", "Leadership", "Problem solving"], min_rating: null, max_rating: null, weight: null, is_active: true },
  { id: "q6", section_id: "sec-3", text: "Preferred development approach", description: "Choose your preferred learning method", question_type: "dropdown", display_order: 1, is_required: true, options: ["Mentorship", "Online courses", "Workshop/Seminar", "On-the-job training", "Self-study"], min_rating: null, max_rating: null, weight: null, is_active: true },
  { id: "q7", section_id: "sec-3", text: "Target date for development goal", description: "When do you plan to complete your development goal?", question_type: "date", display_order: 2, is_required: true, options: null, min_rating: null, max_rating: null, weight: null, is_active: true },
  { id: "q8", section_id: "sec-3", text: "Describe your career goals for the next 12 months", description: "Include short-term and long-term aspirations", question_type: "textarea", display_order: 3, is_required: true, options: null, min_rating: null, max_rating: null, weight: null, is_active: true },
];

export const MOCK_SECTIONS: EvaluationSection[] = [
  { id: "sec-1", template_id: "tmpl-1", title: "Goals & Achievements", description: "Review of quarterly goals and key accomplishments", display_order: 1, is_active: true, questions: [MOCK_QUESTIONS[0], MOCK_QUESTIONS[1]] },
  { id: "sec-2", template_id: "tmpl-1", title: "Competencies", description: "Core competency assessment", display_order: 2, is_active: true, questions: [MOCK_QUESTIONS[2], MOCK_QUESTIONS[3], MOCK_QUESTIONS[4]] },
  { id: "sec-3", template_id: "tmpl-1", title: "Development Plan", description: "Future development goals and training needs", display_order: 3, is_active: true, questions: [MOCK_QUESTIONS[5], MOCK_QUESTIONS[6], MOCK_QUESTIONS[7]] },
];

export const MOCK_TEMPLATES: EvaluationTemplate[] = [
  {
    id: "tmpl-1", name: "Standard Performance Review", code: "STD-PR-001",
    description: "Standard quarterly performance review template with goal review, competencies, and development plan",
    review_period_id: "period-1", status: "active", version: 1, is_active: true,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
    sections: MOCK_SECTIONS,
    review_period: MOCK_REVIEW_PERIODS[0],
  },
];

export const MOCK_EVALUATIONS: EmployeeEvaluation[] = [
  {
    id: "eval-1", employee_id: "emp-1", review_period_id: "period-1", template_id: "tmpl-1",
    status: "approved", employee_comment: "It was a productive quarter. I completed all my goals.",
    submitted_at: "2026-02-15T10:00:00Z", approved_at: "2026-02-20T14:00:00Z", overall_score: 4.2,
    is_active: true, created_at: "2026-02-10T08:00:00Z", updated_at: null,
    employee: MOCK_EMPLOYEES[0], review_period: MOCK_REVIEW_PERIODS[0], template: MOCK_TEMPLATES[0],
    ratings: [
      { id: "r1", evaluation_id: "eval-1", question_id: "q1", rating_value: 4, text_value: null, selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[0] },
      { id: "r2", evaluation_id: "eval-1", question_id: "q2", rating_value: null, text_value: "1. Delivered the API migration on time\n2. Reduced bug rate by 30%\n3. Mentored two junior engineers", selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[1] },
      { id: "r3", evaluation_id: "eval-1", question_id: "q3", rating_value: 5, text_value: null, selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[2] },
      { id: "r4", evaluation_id: "eval-1", question_id: "q4", rating_value: 4, text_value: null, selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[3] },
      { id: "r5", evaluation_id: "eval-1", question_id: "q5", rating_value: null, text_value: null, selected_options: ["Communication", "Leadership"], date_value: null, comment: null, question: MOCK_QUESTIONS[4] },
      { id: "r6", evaluation_id: "eval-1", question_id: "q6", rating_value: null, text_value: null, selected_options: ["Mentorship"], date_value: null, comment: null, question: MOCK_QUESTIONS[5] },
      { id: "r7", evaluation_id: "eval-1", question_id: "q7", rating_value: null, text_value: null, selected_options: null, date_value: "2026-06-30", comment: null, question: MOCK_QUESTIONS[6] },
      { id: "r8", evaluation_id: "eval-1", question_id: "q8", rating_value: null, text_value: "I want to grow into a senior engineering role and lead a small team.", selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[7] },
    ],
    manager_review: {
      id: "mrev-1", evaluation_id: "eval-1", manager_id: "emp-2", status: "approved",
      overall_comment: "Excellent work this quarter. John has shown great initiative.",
      overall_score: 4.5, reviewed_at: "2026-02-20T14:00:00Z", is_active: true,
      created_at: "2026-02-15T12:00:00Z", updated_at: null,
      manager: MOCK_EMPLOYEES[1],
      ratings: [
        { id: "mr1", manager_review_id: "mrev-1", question_id: "q1", rating_value: 4, comment: "Met expectations", question: MOCK_QUESTIONS[0] },
        { id: "mr2", manager_review_id: "mrev-1", question_id: "q3", rating_value: 5, comment: "Outstanding communication", question: MOCK_QUESTIONS[2] },
        { id: "mr3", manager_review_id: "mrev-1", question_id: "q4", rating_value: 4, comment: "Good team player", question: MOCK_QUESTIONS[3] },
      ],
    },
  },
  {
    id: "eval-2", employee_id: "emp-1", review_period_id: "period-2", template_id: "tmpl-1",
    status: "draft", employee_comment: null, submitted_at: null, approved_at: null, overall_score: null,
    is_active: true, created_at: "2026-04-05T09:00:00Z", updated_at: null,
    employee: MOCK_EMPLOYEES[0], review_period: MOCK_REVIEW_PERIODS[1], template: MOCK_TEMPLATES[0],
    ratings: [],
    manager_review: null,
  },
  {
    id: "eval-3", employee_id: "emp-3", review_period_id: "period-1", template_id: "tmpl-1",
    status: "submitted", employee_comment: "Looking forward to feedback.", submitted_at: "2026-02-18T10:00:00Z", approved_at: null, overall_score: null,
    is_active: true, created_at: "2026-02-12T08:00:00Z", updated_at: null,
    employee: MOCK_EMPLOYEES[2], review_period: MOCK_REVIEW_PERIODS[0], template: MOCK_TEMPLATES[0],
    ratings: [
      { id: "r9", evaluation_id: "eval-3", question_id: "q1", rating_value: 3, text_value: null, selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[0] },
      { id: "r10", evaluation_id: "eval-3", question_id: "q2", rating_value: null, text_value: "Completed onboarding and first feature.", selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[1] },
      { id: "r11", evaluation_id: "eval-3", question_id: "q3", rating_value: 3, text_value: null, selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[2] },
      { id: "r12", evaluation_id: "eval-3", question_id: "q4", rating_value: 4, text_value: null, selected_options: null, date_value: null, comment: null, question: MOCK_QUESTIONS[3] },
    ],
    manager_review: null,
  },
  {
    id: "eval-4", employee_id: "emp-2", review_period_id: "period-1", template_id: "tmpl-1",
    status: "draft", employee_comment: null, submitted_at: null, approved_at: null, overall_score: null,
    is_active: true, created_at: "2026-04-08T09:00:00Z", updated_at: null,
    employee: MOCK_EMPLOYEES[1], review_period: MOCK_REVIEW_PERIODS[0], template: MOCK_TEMPLATES[0],
    ratings: [],
    manager_review: null,
  },
];

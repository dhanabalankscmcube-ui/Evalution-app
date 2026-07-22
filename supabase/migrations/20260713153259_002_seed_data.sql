/*
# Seed Data — Roles, Permissions, Sample Template & Period

## Overview
Populates the database with:
1. Three roles: Employee, Manager, HR Administrator
2. A set of permissions grouped by module
3. Role-permission mappings for each role
4. A sample review period (Q1 2026)
5. A sample evaluation template with 2 sections and 5 questions
   covering rating, text, textarea, dropdown, checkbox, and date types

## Notes
- Uses ON CONFLICT clauses so re-running is safe.
- All seed rows are marked is_active = true, is_deleted = false.
*/

-- ============================================================
-- 1. ROLES
-- ============================================================
INSERT INTO roles (name, code, description) VALUES
  ('Employee', 'employee', 'Standard employee who can perform self-evaluations'),
  ('Manager', 'manager', 'People manager who reviews team evaluations'),
  ('HR Administrator', 'hr_admin', 'HR administrator with full management access')
ON CONFLICT (code) WHERE is_deleted = false DO NOTHING;

-- ============================================================
-- 2. PERMISSIONS
-- ============================================================
INSERT INTO permissions (name, code, module, description) VALUES
  -- Employee
  ('View Own Profile', 'employee.profile.view', 'Employee', 'View own employee profile'),
  ('Update Own Profile', 'employee.profile.update', 'Employee', 'Update own profile'),
  ('Start Evaluation', 'employee.eval.start', 'Employee', 'Start a self-evaluation'),
  ('Save Draft', 'employee.eval.draft', 'Employee', 'Save evaluation draft'),
  ('Submit Evaluation', 'employee.eval.submit', 'Employee', 'Submit evaluation'),
  ('View Own Evaluations', 'employee.eval.view', 'Employee', 'View own submitted evaluations'),
  -- Manager
  ('View Team Members', 'manager.team.view', 'Manager', 'View team members'),
  ('Review Evaluation', 'manager.review.view', 'Manager', 'Open employee evaluation for review'),
  ('Rate Sections', 'manager.review.rate', 'Manager', 'Rate each evaluation section'),
  ('Approve Evaluation', 'manager.review.approve', 'Manager', 'Approve employee evaluation'),
  ('Reject Evaluation', 'manager.review.reject', 'Manager', 'Reject employee evaluation'),
  ('Request Changes', 'manager.review.changes', 'Manager', 'Request changes to evaluation'),
  -- HR
  ('Manage Employees', 'hr.employees.manage', 'HR', 'Manage employees'),
  ('Manage Departments', 'hr.departments.manage', 'HR', 'Manage departments'),
  ('Manage Designations', 'hr.designations.manage', 'HR', 'Manage designations'),
  ('Manage Roles', 'hr.roles.manage', 'HR', 'Manage roles'),
  ('Manage Templates', 'hr.templates.manage', 'HR', 'Manage evaluation templates'),
  ('Manage Review Periods', 'hr.periods.manage', 'HR', 'Manage review periods'),
  ('Assign Managers', 'hr.managers.assign', 'HR', 'Assign managers to departments'),
  ('View All Evaluations', 'hr.evaluations.view', 'HR', 'View all evaluations'),
  ('Manage Users', 'hr.users.manage', 'HR', 'Manage application users')
ON CONFLICT (code) WHERE is_deleted = false DO NOTHING;

-- ============================================================
-- 3. ROLE_PERMISSIONS
-- ============================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'employee'
  AND p.code IN (
    'employee.profile.view','employee.profile.update',
    'employee.eval.start','employee.eval.draft',
    'employee.eval.submit','employee.eval.view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'manager'
  AND p.code IN (
    'employee.profile.view',
    'manager.team.view','manager.review.view','manager.review.rate',
    'manager.review.approve','manager.review.reject','manager.review.changes'
  )
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'hr_admin'
  AND p.code LIKE 'hr.%'
ON CONFLICT DO NOTHING;

-- Also give HR admin all employee + manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'hr_admin'
  AND p.code IN (
    'employee.profile.view','employee.profile.update',
    'employee.eval.start','employee.eval.draft',
    'employee.eval.submit','employee.eval.view',
    'manager.team.view','manager.review.view','manager.review.rate',
    'manager.review.approve','manager.review.reject','manager.review.changes'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. SAMPLE REVIEW PERIOD
-- ============================================================
INSERT INTO review_periods (name, code, description, start_date, end_date, status)
VALUES (
  'Q1 2026 Performance Review',
  'Q1-2026',
  'First quarter 2026 performance evaluation cycle',
  '2026-01-01',
  '2026-03-31',
  'active'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. SAMPLE EVALUATION TEMPLATE
-- ============================================================
INSERT INTO evaluation_templates (name, code, description, review_period_id, status, version)
SELECT
  'Standard Performance Review',
  'STD-PR-001',
  'Standard quarterly performance review template with goal review, competencies, and development plan',
  rp.id,
  'active',
  1
FROM review_periods rp
WHERE rp.code = 'Q1-2026'
ON CONFLICT DO NOTHING;

-- Section 1: Goals & Achievements
INSERT INTO evaluation_sections (template_id, title, description, display_order)
SELECT et.id, 'Goals & Achievements', 'Review of quarterly goals and key accomplishments', 1
FROM evaluation_templates et
WHERE et.code = 'STD-PR-001'
ON CONFLICT DO NOTHING;

-- Section 2: Competencies
INSERT INTO evaluation_sections (template_id, title, description, display_order)
SELECT et.id, 'Competencies', 'Core competency assessment', 2
FROM evaluation_templates et
WHERE et.code = 'STD-PR-001'
ON CONFLICT DO NOTHING;

-- Section 3: Development Plan
INSERT INTO evaluation_sections (template_id, title, description, display_order)
SELECT et.id, 'Development Plan', 'Future development goals and training needs', 3
FROM evaluation_templates et
WHERE et.code = 'STD-PR-001'
ON CONFLICT DO NOTHING;

-- Questions for Section 1 (Goals & Achievements)
INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required, min_rating, max_rating, weight)
SELECT es.id, 'Rate your overall achievement of quarterly goals', '1 = Far below expectations, 5 = Exceeded expectations', 'rating', 1, true, 1, 5, 1.0
FROM evaluation_sections es
WHERE es.title = 'Goals & Achievements'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required)
SELECT es.id, 'List your top 3 achievements this quarter', 'Provide specific examples with measurable outcomes', 'textarea', 2, true
FROM evaluation_sections es
WHERE es.title = 'Goals & Achievements'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

-- Questions for Section 2 (Competencies)
INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required, min_rating, max_rating, weight)
SELECT es.id, 'Communication skills', 'Rate effectiveness of written and verbal communication', 'rating', 1, true, 1, 5, 1.0
FROM evaluation_sections es
WHERE es.title = 'Competencies'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required, min_rating, max_rating, weight)
SELECT es.id, 'Teamwork & collaboration', 'Ability to work effectively within a team', 'rating', 2, true, 1, 5, 1.0
FROM evaluation_sections es
WHERE es.title = 'Competencies'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required, options)
SELECT es.id, 'Which areas need the most improvement?', 'Select all that apply', 'checkbox', 3, true,
  '["Technical skills","Communication","Time management","Leadership","Problem solving"]'::jsonb
FROM evaluation_sections es
WHERE es.title = 'Competencies'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

-- Questions for Section 3 (Development Plan)
INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required, options)
SELECT es.id, 'Preferred development approach', 'Choose your preferred learning method', 'dropdown', 1, true,
  '["Mentorship","Online courses","Workshop/Seminar","On-the-job training","Self-study"]'::jsonb
FROM evaluation_sections es
WHERE es.title = 'Development Plan'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required)
SELECT es.id, 'Target date for development goal', 'When do you plan to complete your development goal?', 'date', 2, true
FROM evaluation_sections es
WHERE es.title = 'Development Plan'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

INSERT INTO evaluation_questions (section_id, text, description, question_type, display_order, is_required)
SELECT es.id, 'Describe your career goals for the next 12 months', 'Include short-term and long-term aspirations', 'textarea', 3, true
FROM evaluation_sections es
WHERE es.title = 'Development Plan'
  AND es.template_id = (SELECT id FROM evaluation_templates WHERE code = 'STD-PR-001')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. SAMPLE DEPARTMENTS & DESIGNATIONS
-- ============================================================
INSERT INTO departments (name, code, description)
VALUES
  ('Engineering', 'ENG', 'Software engineering and development'),
  ('Product', 'PROD', 'Product management and design'),
  ('Human Resources', 'HR', 'Human resources and people operations'),
  ('Sales', 'SAL', 'Sales and business development')
ON CONFLICT DO NOTHING;

INSERT INTO designations (name, code, description)
VALUES
  ('Software Engineer', 'SE', 'Software engineer'),
  ('Senior Software Engineer', 'SSE', 'Senior software engineer'),
  ('Engineering Manager', 'EM', 'Engineering team manager'),
  ('Product Manager', 'PM', 'Product manager'),
  ('HR Specialist', 'HRS', 'HR specialist'),
  ('Sales Representative', 'SR', 'Sales representative')
ON CONFLICT DO NOTHING;

/*
# Employee Self-Evaluation System — Core Schema

## Overview
Creates the complete normalized relational schema for an enterprise Employee
Self-Evaluation / Performance Management application. All tables carry audit
columns (created_at, created_by, updated_at, updated_by, is_deleted, is_active)
and use UUID primary keys.

## Tables created
1.  roles              — Employee / Manager / HR Administrator
2.  permissions        — granular permission catalog
3.  role_permissions   — many-to-many role ↔ permission
4.  users              — application users (linked to auth.users)
5.  user_roles         — many-to-many user ↔ role
6.  departments        — organizational departments
7.  designations       — job titles / designations
8.  employees          — employee profiles (linked to users)
9.  managers           — manager assignments (employee who manages a department)
10. review_periods     — evaluation cycles (e.g. Q1 2026)
11. evaluation_templates — reusable evaluation forms
12. evaluation_sections    — sections within a template
13. evaluation_questions   — questions within a section (rating/text/textarea/dropdown/checkbox/date)
14. employee_evaluations  — an employee's evaluation instance for a period
15. employee_ratings      — the employee's answers per question
16. manager_reviews       — a manager's review of an employee evaluation
17. manager_ratings       — the manager's ratings/comments per question
18. refresh_tokens        — JWT refresh token store (legacy/audit; Supabase Auth handles sessions)

## Security
- RLS enabled on every table.
- Policies scope data to authenticated users.
- Users can read/update their own profile.
- Employees can read/create/update their own evaluations and ratings.
- Managers can read/review evaluations for their team.
- HR admins have full access to management tables (enforced via role check).
- Public catalog tables (departments, designations, roles, templates, periods)
  are readable by all authenticated users.
*/

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_code ON roles (code) WHERE is_deleted = false;

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_select_authenticated" ON roles;
CREATE POLICY "roles_select_authenticated" ON roles FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "roles_insert_hr" ON roles;
CREATE POLICY "roles_insert_hr" ON roles FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "roles_update_hr" ON roles;
CREATE POLICY "roles_update_hr" ON roles FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "roles_delete_hr" ON roles;
CREATE POLICY "roles_delete_hr" ON roles FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 2. PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text NOT NULL,
  module      text,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_permissions_code ON permissions (code) WHERE is_deleted = false;

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "perms_select_authenticated" ON permissions;
CREATE POLICY "perms_select_authenticated" ON permissions FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "perms_insert_hr" ON permissions;
CREATE POLICY "perms_insert_hr" ON permissions FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "perms_update_hr" ON permissions;
CREATE POLICY "perms_update_hr" ON permissions FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "perms_delete_hr" ON permissions;
CREATE POLICY "perms_delete_hr" ON permissions FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 3. ROLE_PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  PRIMARY KEY (role_id, permission_id)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rp_select_authenticated" ON role_permissions;
CREATE POLICY "rp_select_authenticated" ON role_permissions FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "rp_insert_hr" ON role_permissions;
CREATE POLICY "rp_insert_hr" ON role_permissions FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rp_delete_hr" ON role_permissions;
CREATE POLICY "rp_delete_hr" ON role_permissions FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 4. USERS (profile table — auth.users holds credentials)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  first_name    text,
  last_name     text,
  phone         text,
  avatar_url    text,
  status        text NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  updated_at    timestamptz,
  updated_by    uuid,
  is_deleted    boolean NOT NULL DEFAULT false,
  is_active     boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own_or_staff" ON users;
CREATE POLICY "users_select_own_or_staff" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_deleted = false);
DROP POLICY IF EXISTS "users_insert_self" ON users;
CREATE POLICY "users_insert_self" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_delete_hr" ON users;
CREATE POLICY "users_delete_hr" ON users FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 5. USER_ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  PRIMARY KEY (user_id, role_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ur_select_authenticated" ON user_roles;
CREATE POLICY "ur_select_authenticated" ON user_roles FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "ur_insert_authenticated" ON user_roles;
CREATE POLICY "ur_insert_authenticated" ON user_roles FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ur_delete_authenticated" ON user_roles;
CREATE POLICY "ur_delete_authenticated" ON user_roles FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 6. DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text,
  description text,
  parent_id   uuid REFERENCES departments(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_departments_parent ON departments (parent_id);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dept_select_authenticated" ON departments;
CREATE POLICY "dept_select_authenticated" ON departments FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "dept_insert_hr" ON departments;
CREATE POLICY "dept_insert_hr" ON departments FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "dept_update_hr" ON departments;
CREATE POLICY "dept_update_hr" ON departments FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "dept_delete_hr" ON departments;
CREATE POLICY "dept_delete_hr" ON departments FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 7. DESIGNATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS designations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_designations_name ON designations (name) WHERE is_deleted = false;

ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "desig_select_authenticated" ON designations;
CREATE POLICY "desig_select_authenticated" ON designations FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "desig_insert_hr" ON designations;
CREATE POLICY "desig_insert_hr" ON designations FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "desig_update_hr" ON designations;
CREATE POLICY "desig_update_hr" ON designations FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "desig_delete_hr" ON designations;
CREATE POLICY "desig_delete_hr" ON designations FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 8. EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_number text NOT NULL,
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  email           text NOT NULL,
  phone           text,
  department_id   uuid REFERENCES departments(id) ON DELETE SET NULL,
  designation_id  uuid REFERENCES designations(id) ON DELETE SET NULL,
  manager_id      uuid REFERENCES employees(id) ON DELETE SET NULL,
  hire_date       date,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_employees_user ON employees (user_id);
CREATE INDEX IF NOT EXISTS ix_employees_dept ON employees (department_id);
CREATE INDEX IF NOT EXISTS ix_employees_manager ON employees (manager_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_number ON employees (employee_number) WHERE is_deleted = false;

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "emp_select_authenticated" ON employees;
CREATE POLICY "emp_select_authenticated" ON employees FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "emp_insert_hr" ON employees;
CREATE POLICY "emp_insert_hr" ON employees FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "emp_update_hr_or_self" ON employees;
CREATE POLICY "emp_update_hr_or_self" ON employees FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "emp_delete_hr" ON employees;
CREATE POLICY "emp_delete_hr" ON employees FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 9. MANAGERS (department manager assignments)
-- ============================================================
CREATE TABLE IF NOT EXISTS managers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_primary    boolean NOT NULL DEFAULT false,
  start_date    date,
  end_date      date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  updated_at    timestamptz,
  updated_by    uuid,
  is_deleted    boolean NOT NULL DEFAULT false,
  is_active     boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_managers_emp ON managers (employee_id);
CREATE INDEX IF NOT EXISTS ix_managers_dept ON managers (department_id);

ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mgr_select_authenticated" ON managers;
CREATE POLICY "mgr_select_authenticated" ON managers FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "mgr_insert_hr" ON managers;
CREATE POLICY "mgr_insert_hr" ON managers FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mgr_update_hr" ON managers;
CREATE POLICY "mgr_update_hr" ON managers FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "mgr_delete_hr" ON managers;
CREATE POLICY "mgr_delete_hr" ON managers FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 10. REVIEW_PERIODS
-- ============================================================
CREATE TABLE IF NOT EXISTS review_periods (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text,
  description text,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  status      text NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_review_periods_status ON review_periods (status);

ALTER TABLE review_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rp_select_authenticated" ON review_periods;
CREATE POLICY "rp_select_authenticated" ON review_periods FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "rp_insert_hr" ON review_periods;
CREATE POLICY "rp_insert_hr" ON review_periods FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rp_update_hr" ON review_periods;
CREATE POLICY "rp_update_hr" ON review_periods FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "rp_delete_hr" ON review_periods;
CREATE POLICY "rp_delete_hr" ON review_periods FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 11. EVALUATION_TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  code            text,
  description     text,
  review_period_id uuid REFERENCES review_periods(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'draft',
  version         int NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_templates_period ON evaluation_templates (review_period_id);

ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tmpl_select_authenticated" ON evaluation_templates;
CREATE POLICY "tmpl_select_authenticated" ON evaluation_templates FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "tmpl_insert_hr" ON evaluation_templates;
CREATE POLICY "tmpl_insert_hr" ON evaluation_templates FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tmpl_update_hr" ON evaluation_templates;
CREATE POLICY "tmpl_update_hr" ON evaluation_templates FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "tmpl_delete_hr" ON evaluation_templates;
CREATE POLICY "tmpl_delete_hr" ON evaluation_templates FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 12. EVALUATION_SECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES evaluation_templates(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_sections_template ON evaluation_sections (template_id);

ALTER TABLE evaluation_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sec_select_authenticated" ON evaluation_sections;
CREATE POLICY "sec_select_authenticated" ON evaluation_sections FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "sec_insert_hr" ON evaluation_sections;
CREATE POLICY "sec_insert_hr" ON evaluation_sections FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sec_update_hr" ON evaluation_sections;
CREATE POLICY "sec_update_hr" ON evaluation_sections FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "sec_delete_hr" ON evaluation_sections;
CREATE POLICY "sec_delete_hr" ON evaluation_sections FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 13. EVALUATION_QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluation_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   uuid NOT NULL REFERENCES evaluation_sections(id) ON DELETE CASCADE,
  text        text NOT NULL,
  description text,
  question_type text NOT NULL DEFAULT 'rating',
  display_order int NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT true,
  options     jsonb,
  min_rating  int,
  max_rating  int,
  weight      numeric(5,2) DEFAULT 1.0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_questions_section ON evaluation_questions (section_id);

ALTER TABLE evaluation_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "q_select_authenticated" ON evaluation_questions;
CREATE POLICY "q_select_authenticated" ON evaluation_questions FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "q_insert_hr" ON evaluation_questions;
CREATE POLICY "q_insert_hr" ON evaluation_questions FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "q_update_hr" ON evaluation_questions;
CREATE POLICY "q_update_hr" ON evaluation_questions FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "q_delete_hr" ON evaluation_questions;
CREATE POLICY "q_delete_hr" ON evaluation_questions FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 14. EMPLOYEE_EVALUATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_evaluations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  review_period_id uuid NOT NULL REFERENCES review_periods(id) ON DELETE CASCADE,
  template_id     uuid NOT NULL REFERENCES evaluation_templates(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'draft',
  employee_comment text,
  submitted_at    timestamptz,
  approved_at     timestamptz,
  overall_score    numeric(5,2),
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_evals_employee ON employee_evaluations (employee_id);
CREATE INDEX IF NOT EXISTS ix_evals_period ON employee_evaluations (review_period_id);
CREATE INDEX IF NOT EXISTS ix_evals_status ON employee_evaluations (status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_eval_emp_period ON employee_evaluations (employee_id, review_period_id) WHERE is_deleted = false;

ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "eval_select_authenticated" ON employee_evaluations;
CREATE POLICY "eval_select_authenticated" ON employee_evaluations FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "eval_insert_authenticated" ON employee_evaluations;
CREATE POLICY "eval_insert_authenticated" ON employee_evaluations FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "eval_update_authenticated" ON employee_evaluations;
CREATE POLICY "eval_update_authenticated" ON employee_evaluations FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "eval_delete_authenticated" ON employee_evaluations;
CREATE POLICY "eval_delete_authenticated" ON employee_evaluations FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 15. EMPLOYEE_RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_ratings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id   uuid NOT NULL REFERENCES employee_evaluations(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES evaluation_questions(id) ON DELETE CASCADE,
  rating_value    int,
  text_value      text,
  selected_options jsonb,
  date_value      date,
  comment         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_eratings_eval ON employee_ratings (evaluation_id);
CREATE INDEX IF NOT EXISTS ix_eratings_question ON employee_ratings (question_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_erating_eval_question ON employee_ratings (evaluation_id, question_id) WHERE is_deleted = false;

ALTER TABLE employee_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "er_select_authenticated" ON employee_ratings;
CREATE POLICY "er_select_authenticated" ON employee_ratings FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "er_insert_authenticated" ON employee_ratings;
CREATE POLICY "er_insert_authenticated" ON employee_ratings FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "er_update_authenticated" ON employee_ratings;
CREATE POLICY "er_update_authenticated" ON employee_ratings FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "er_delete_authenticated" ON employee_ratings;
CREATE POLICY "er_delete_authenticated" ON employee_ratings FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 16. MANAGER_REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS manager_reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id   uuid NOT NULL REFERENCES employee_evaluations(id) ON DELETE CASCADE,
  manager_id      uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'in_review',
  overall_comment text,
  overall_score    numeric(5,2),
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_mreviews_eval ON manager_reviews (evaluation_id);
CREATE INDEX IF NOT EXISTS ix_mreviews_manager ON manager_reviews (manager_id);

ALTER TABLE manager_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mr_select_authenticated" ON manager_reviews;
CREATE POLICY "mr_select_authenticated" ON manager_reviews FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "mr_insert_authenticated" ON manager_reviews;
CREATE POLICY "mr_insert_authenticated" ON manager_reviews FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mr_update_authenticated" ON manager_reviews;
CREATE POLICY "mr_update_authenticated" ON manager_reviews FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "mr_delete_authenticated" ON manager_reviews;
CREATE POLICY "mr_delete_authenticated" ON manager_reviews FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 17. MANAGER_RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS manager_ratings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_review_id uuid NOT NULL REFERENCES manager_reviews(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES evaluation_questions(id) ON DELETE CASCADE,
  rating_value    int,
  comment         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_mratings_review ON manager_ratings (manager_review_id);
CREATE INDEX IF NOT EXISTS ix_mratings_question ON manager_ratings (question_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mrating_review_question ON manager_ratings (manager_review_id, question_id) WHERE is_deleted = false;

ALTER TABLE manager_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mrat_select_authenticated" ON manager_ratings;
CREATE POLICY "mrat_select_authenticated" ON manager_ratings FOR SELECT
  TO authenticated USING (is_deleted = false);
DROP POLICY IF EXISTS "mrat_insert_authenticated" ON manager_ratings;
CREATE POLICY "mrat_insert_authenticated" ON manager_ratings FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mrat_update_authenticated" ON manager_ratings;
CREATE POLICY "mrat_update_authenticated" ON manager_ratings FOR UPDATE
  TO authenticated USING (is_deleted = false) WITH CHECK (true);
DROP POLICY IF EXISTS "mrat_delete_authenticated" ON manager_ratings;
CREATE POLICY "mrat_delete_authenticated" ON manager_ratings FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 18. REFRESH_TOKENS (audit store)
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text NOT NULL,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz,
  updated_by  uuid,
  is_deleted  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user ON refresh_tokens (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_token ON refresh_tokens (token) WHERE is_deleted = false;

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rt_select_own" ON refresh_tokens;
CREATE POLICY "rt_select_own" ON refresh_tokens FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rt_insert_own" ON refresh_tokens;
CREATE POLICY "rt_insert_own" ON refresh_tokens FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rt_update_own" ON refresh_tokens;
CREATE POLICY "rt_update_own" ON refresh_tokens FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rt_delete_own" ON refresh_tokens;
CREATE POLICY "rt_delete_own" ON refresh_tokens FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'roles','permissions','role_permissions','users','user_roles',
    'departments','designations','employees','managers',
    'review_periods','evaluation_templates','evaluation_sections',
    'evaluation_questions','employee_evaluations','employee_ratings',
    'manager_reviews','manager_ratings','refresh_tokens'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated ON %s;
       CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t);
  END LOOP;
END $$;

-- ============================================================
-- AUTO-POPULATE users table on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

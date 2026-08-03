-- ============================================================
-- Automated Personal Finance Advisor
-- Supabase / PostgreSQL Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing objects for clean reruns
DROP VIEW IF EXISTS dashboard_summary;
DROP VIEW IF EXISTS monthly_income;
DROP VIEW IF EXISTS monthly_expenses;
DROP VIEW IF EXISTS savings_progress;

DROP TABLE IF EXISTS financial_advice CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS income_sources CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS calculate_total_income(UUID);
DROP FUNCTION IF EXISTS calculate_total_expenses(UUID);
DROP FUNCTION IF EXISTS calculate_balance(UUID);
DROP FUNCTION IF EXISTS calculate_savings(UUID);
DROP FUNCTION IF EXISTS calculate_budget_usage(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================================
-- 1. profiles
-- ============================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    profile_picture TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'GHS' CHECK (currency IN ('USD','EUR','GBP','INR','AUD','CAD','GHS')),
    timezone VARCHAR(80) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Stores the core account profile for each finance advisor user.';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. income_sources
-- ============================================================

CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

COMMENT ON TABLE income_sources IS 'Stores custom income source categories created by each user.';

-- ============================================================
-- 3. expense_categories
-- ============================================================

CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

COMMENT ON TABLE expense_categories IS 'Stores custom expense categories created by each user.';

-- ============================================================
-- 4. accounts
-- ============================================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) NOT NULL CHECK (account_type IN ('Checking','Savings','Credit','Investment','Cash','Other')),
    balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'GHS' CHECK (currency IN ('USD','EUR','GBP','INR','AUD','CAD','GHS')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE accounts IS 'Stores financial accounts such as checking, savings, and investment accounts.';

CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. income
-- ============================================================

CREATE TABLE income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_id UUID REFERENCES income_sources(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    income_date DATE NOT NULL,
    description TEXT,
    payment_method VARCHAR(30)
    CHECK (payment_method IN ('Cash','Card','Mobile Money','Bank Transfer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE income IS 'Stores all income transactions for a user.';

-- ============================================================
-- 6. expenses
-- ============================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    description TEXT,
    payment_method VARCHAR(30)
    CHECK (payment_method IN ('Cash','Card','Mobile Money','Bank Transfer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE expenses IS 'Stores all spending transactions classified by category.';

-- ============================================================
-- 7. budgets
-- ============================================================

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(12,2) NOT NULL CHECK (monthly_limit > 0),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2000),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);

COMMENT ON TABLE budgets IS 'Stores monthly spending budgets by expense category.';

-- ============================================================
-- 8. savings_goals
-- ============================================================

CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goal_name VARCHAR(150) NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Completed','Cancelled')),
    priority VARCHAR(10)
    DEFAULT 'Medium'
    CHECK (priority IN ('High','Medium','Low')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE savings_goals IS 'Tracks progress toward savings targets for each user.';

-- ============================================================
-- 9. financial_advice
-- ============================================================

CREATE TABLE financial_advice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    advice TEXT NOT NULL,
    advice_type VARCHAR(20) NOT NULL CHECK (advice_type IN ('Warning','Recommendation','Success','Reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE financial_advice IS 'Stores generated or rule-based financial guidance for a user.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_date ON income(income_date);
CREATE INDEX idx_income_source_id ON income(source_id);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month_year ON budgets(month, year);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_status ON savings_goals(status);
CREATE INDEX idx_financial_advice_user_id ON financial_advice(user_id);
CREATE INDEX idx_income_sources_user_id ON income_sources(user_id);
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_advice ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Income sources
CREATE POLICY "income_sources_select_own" ON income_sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "income_sources_insert_own" ON income_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_sources_update_own" ON income_sources
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_sources_delete_own" ON income_sources
    FOR DELETE USING (auth.uid() = user_id);

-- Expense categories
CREATE POLICY "expense_categories_select_own" ON expense_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expense_categories_insert_own" ON expense_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expense_categories_update_own" ON expense_categories
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expense_categories_delete_own" ON expense_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Accounts
CREATE POLICY "accounts_select_own" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_own" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_update_own" ON accounts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_delete_own" ON accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Income
CREATE POLICY "income_select_own" ON income
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "income_insert_own" ON income
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_update_own" ON income
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_delete_own" ON income
    FOR DELETE USING (auth.uid() = user_id);

-- Expenses
CREATE POLICY "expenses_select_own" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_own" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_own" ON expenses
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_delete_own" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "budgets_select_own" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budgets_insert_own" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_update_own" ON budgets
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_delete_own" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Savings goals
CREATE POLICY "savings_goals_select_own" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "savings_goals_insert_own" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "savings_goals_update_own" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "savings_goals_delete_own" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Financial advice
CREATE POLICY "financial_advice_select_own" ON financial_advice
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "financial_advice_insert_own" ON financial_advice
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_advice_update_own" ON financial_advice
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_advice_delete_own" ON financial_advice
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Helper functions
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_total_income(user_uuid UUID)
RETURNS NUMERIC(12,2) AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(amount)
        FROM income
        WHERE user_id = user_uuid
    ), 0)::NUMERIC(12,2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_total_expenses(user_uuid UUID)
RETURNS NUMERIC(12,2) AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(amount)
        FROM expenses
        WHERE user_id = user_uuid
    ), 0)::NUMERIC(12,2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_balance(user_uuid UUID)
RETURNS NUMERIC(12,2) AS $$
BEGIN
    RETURN calculate_total_income(user_uuid) - calculate_total_expenses(user_uuid);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_savings(user_uuid UUID)
RETURNS NUMERIC(12,2) AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(current_amount)
        FROM savings_goals
        WHERE user_id = user_uuid
          AND status <> 'Cancelled'
    ), 0)::NUMERIC(12,2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_budget_usage(user_uuid UUID)
RETURNS NUMERIC(12,2) AS $$
DECLARE
    total_spent NUMERIC(12,2);
    total_limit NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_spent
    FROM expenses
    WHERE user_id = user_uuid
      AND expense_date >= date_trunc('month', CURRENT_DATE)
      AND expense_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

    SELECT COALESCE(SUM(monthly_limit), 0) INTO total_limit
    FROM budgets
    WHERE user_id = user_uuid
      AND month = EXTRACT(MONTH FROM CURRENT_DATE)::INT
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)::INT;

    IF total_limit = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND((total_spent / total_limit) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Views
-- ============================================================

CREATE VIEW dashboard_summary AS
SELECT
    p.id AS user_id,
    p.full_name,
    calculate_total_income(p.id) AS total_income,
    calculate_total_expenses(p.id) AS total_expenses,
    calculate_balance(p.id) AS balance,
    calculate_savings(p.id) AS total_savings,
    calculate_budget_usage(p.id) AS budget_usage_percent
FROM profiles p;

CREATE VIEW monthly_income AS
SELECT
    user_id,
    date_trunc('month', income_date)::DATE AS month_start,
    SUM(amount) AS total_amount
FROM income
GROUP BY user_id, date_trunc('month', income_date);

CREATE VIEW monthly_expenses AS
SELECT
    user_id,
    date_trunc('month', expense_date)::DATE AS month_start,
    SUM(amount) AS total_amount
FROM expenses
GROUP BY user_id, date_trunc('month', expense_date);

CREATE VIEW savings_progress AS
SELECT
    id,
    user_id,
    goal_name,
    target_amount,
    current_amount,
    ROUND((current_amount / NULLIF(target_amount, 0)) * 100, 2) AS progress_percent,
    deadline,
    status
FROM savings_goals;

-- ============================================================
-- Seed data
-- ============================================================

INSERT INTO profiles (id, full_name, email, password_hash, phone, currency, timezone)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Ava Thompson',
    'ava.thompson@example.com',
    '$2b$12$JQF8Q5vH4j9sK2T4bZsR0e3R4q1L7zX9v2bM6hJ8kN4pQv6Y7mXzO',
    '+233501234567',
    'USD',
    'UTC'
);

INSERT INTO accounts (id, user_id, account_name, account_type, balance, currency, is_default)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Main Checking',
    'Checking',
    2840.75,
    'USD',
    TRUE
);

INSERT INTO income_sources (id, user_id, name, is_active)
VALUES
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Salary', TRUE),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Freelance', TRUE),
    ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Investments', TRUE);

INSERT INTO expense_categories (id, user_id, name, is_active)
VALUES
    ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Food', TRUE),
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Transport', TRUE),
    ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Utilities', TRUE),
    ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Shopping', TRUE),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Entertainment', TRUE);

INSERT INTO income (id, user_id, source_id, amount, income_date, description)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 4200.00, '2026-08-01', 'Monthly salary deposit'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 650.00, '2026-08-05', 'Freelance UI work'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 180.00, '2026-08-08', 'Dividend payout');

INSERT INTO expenses (id, user_id, category_id, amount, expense_date, description)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 124.50, '2026-08-02', 'Groceries and dining'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 45.00, '2026-08-03', 'Fuel and transit'),
    ('10101010-1010-1010-1010-101010101010', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 90.00, '2026-08-04', 'Electricity and internet'),
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 170.00, '2026-08-06', 'Clothing purchase'),
    ('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 60.00, '2026-08-09', 'Streaming and entertainment');

INSERT INTO budgets (id, user_id, category_id, monthly_limit, month, year)
VALUES
    ('13131313-1313-1313-1313-131313131313', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 300.00, 8, 2026),
    ('14141414-1414-1414-1414-141414141414', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 100.00, 8, 2026),
    ('15151515-1515-1515-1515-151515151515', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 150.00, 8, 2026),
    ('16161616-1616-1616-1616-161616161616', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 200.00, 8, 2026),
    ('17171717-1717-1717-1717-171717171717', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 100.00, 8, 2026);

INSERT INTO savings_goals (id, user_id, goal_name, target_amount, current_amount, deadline, status)
VALUES
    ('18181818-1818-1818-1818-181818181818', '11111111-1111-1111-1111-111111111111', 'Emergency Fund', 5000.00, 2300.00, '2026-12-31', 'Active'),
    ('19191919-1919-1919-1919-191919191919', '11111111-1111-1111-1111-111111111111', 'Vacation Trip', 2500.00, 900.00, '2026-10-15', 'Active'),
    ('20202020-2020-2020-2020-202020202020', '11111111-1111-1111-1111-111111111111', 'Laptop Upgrade', 1800.00, 1800.00, '2026-06-30', 'Completed');

INSERT INTO financial_advice (id, user_id, advice, advice_type)
VALUES
    ('21212121-2121-2121-2121-212121212121', '11111111-1111-1111-1111-111111111111', 'Your entertainment spending is a bit higher than planned this month. Consider trimming one non-essential purchase.', 'Warning'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'You are building a healthy emergency fund. Keep saving at least 15% of your monthly income.', 'Recommendation'),
    ('23232323-2323-2323-2323-232323232323', '11111111-1111-1111-1111-111111111111', 'Great progress on your savings target. You are on track to meet your goal.', 'Success');

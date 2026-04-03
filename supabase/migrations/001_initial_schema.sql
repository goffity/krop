-- ============================================
-- Krop Finance Tracker — Initial Schema
-- ============================================

-- ==========================================
-- 1. Categories (custom categories support)
-- ==========================================
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  key         varchar NOT NULL,
  label       varchar NOT NULL,
  icon        varchar NOT NULL DEFAULT '📂',
  color       varchar NOT NULL DEFAULT '#8888aa',
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 2. Transactions
-- ==========================================
CREATE TABLE transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  type        text CHECK (type IN ('income', 'expense')) NOT NULL,
  amount      numeric NOT NULL,
  category    varchar NOT NULL,
  note        text,
  date        date NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Index for fast monthly queries
CREATE INDEX idx_transactions_user_date ON transactions (user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON transactions (user_id, category);

-- ==========================================
-- 3. Budgets
-- ==========================================
CREATE TABLE budgets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  category    varchar NOT NULL,
  amount      numeric NOT NULL,
  month       varchar NOT NULL, -- format: '2026-03'
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, category, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 4. Savings Goals
-- ==========================================
CREATE TABLE savings_goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  name        varchar NOT NULL,
  target      numeric NOT NULL,
  current     numeric DEFAULT 0,
  icon        varchar,
  color       varchar,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own savings_goals" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 5. User Profiles
-- ==========================================
CREATE TABLE profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL UNIQUE,
  display_name varchar,
  avatar_url   text,
  currency     varchar NOT NULL DEFAULT 'THB',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 6. Auto-create profile + default categories on signup
-- ==========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  -- Create default categories
  INSERT INTO categories (user_id, key, label, icon, color, is_default) VALUES
    (NEW.id, 'food',          'อาหาร',     '🍜', '#ff6b6b', true),
    (NEW.id, 'transport',     'เดินทาง',    '🚇', '#54a0ff', true),
    (NEW.id, 'shopping',      'ช้อปปิ้ง',   '🛒', '#feca57', true),
    (NEW.id, 'health',        'สุขภาพ',     '💊', '#00b894', true),
    (NEW.id, 'entertainment', 'บันเทิง',    '🎬', '#a29bfe', true),
    (NEW.id, 'bills',         'ค่าบิล',     '📄', '#54a0ff', true),
    (NEW.id, 'education',     'การศึกษา',   '📚', '#00b894', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

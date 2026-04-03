-- Fix: handle_new_user trigger
-- Issue: raw_user_meta_data might be null, causing insert to fail

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );

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
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

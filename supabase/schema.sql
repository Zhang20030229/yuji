-- 遇己 Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. 情绪记录表
CREATE TABLE IF NOT EXISTS mood_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood SMALLINT NOT NULL CHECK (mood >= 1 AND mood <= 5),
  tags TEXT[] DEFAULT '{}',
  event TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 决策记录表
CREATE TABLE IF NOT EXISTS decision_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  reflections TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 年度觉察报告表
CREATE TABLE IF NOT EXISTS annual_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year SMALLINT NOT NULL,
  overall_mood_avg DECIMAL(3, 2),
  top_moods TEXT[],
  top_tags TEXT[],
  key_decisions TEXT[],
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;

-- 用户资料策略：用户只能访问自己的数据
CREATE POLICY "用户只能访问自己的资料"
  ON user_profiles FOR ALL
  USING (auth.uid() = id);

-- 情绪记录策略：用户只能访问自己的记录
CREATE POLICY "用户只能访问自己的情绪记录"
  ON mood_records FOR ALL
  USING (auth.uid() = user_id);

-- 决策记录策略：用户只能访问自己的记录
CREATE POLICY "用户只能访问自己的决策记录"
  ON decision_records FOR ALL
  USING (auth.uid() = user_id);

-- 年度报告策略：用户只能访问自己的报告
CREATE POLICY "用户只能访问自己的年度报告"
  ON annual_reports FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 索引优化
-- ============================================

CREATE INDEX IF NOT EXISTS idx_mood_records_user_id ON mood_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_records_created_at ON mood_records(created_at);
CREATE INDEX IF NOT EXISTS idx_decision_records_user_id ON decision_records(user_id);
CREATE INDEX IF NOT EXISTS idx_annual_reports_user_year ON annual_reports(user_id, year);

-- ============================================
-- 自动触发器：匿名用户自动创建资料
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at)
  VALUES (NEW.id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

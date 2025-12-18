-- 五险一金计算器数据库创建脚本
-- 请在 Supabase 的 SQL Editor 中执行以下脚本

-- 1. 创建城市标准表
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  rate DECIMAL(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  base_min INTEGER NOT NULL CHECK (base_min >= 0),
  base_max INTEGER NOT NULL CHECK (base_max >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建员工工资表
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL CHECK (month ~ '^\d{6}$'),
  salary_amount INTEGER NOT NULL CHECK (salary_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建计算结果表
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary DECIMAL(10,2) NOT NULL CHECK (avg_salary >= 0),
  contribution_base DECIMAL(10,2) NOT NULL CHECK (contribution_base >= 0),
  company_fee DECIMAL(10,2) NOT NULL CHECK (company_fee >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_cities_city_year ON cities(city_name, year);
CREATE INDEX IF NOT EXISTS idx_salaries_employee ON salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month);
CREATE INDEX IF NOT EXISTS idx_results_created ON results(created_at);

-- 5. 启用 RLS (Row Level Security)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略（允许所有操作，因为这是公开应用）
-- 城市表策略
CREATE POLICY "Allow all operations on cities" ON cities
  FOR ALL USING (true)
  WITH CHECK (true);

-- 工资表策略
CREATE POLICY "Allow all operations on salaries" ON salaries
  FOR ALL USING (true)
  WITH CHECK (true);

-- 结果表策略
CREATE POLICY "Allow all operations on results" ON results
  FOR ALL USING (true)
  WITH CHECK (true);

-- 7. 插入示例数据（可选）
INSERT INTO cities (city_name, year, rate, base_min, base_max) VALUES
('南山', '2024', 0.14, 4546, 26421)
ON CONFLICT DO NOTHING;

-- 8. 验证表结构
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('cities', 'salaries', 'results')
ORDER BY table_name, ordinal_position;
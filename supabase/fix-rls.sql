-- 修复 RLS 策略，允许服务器端插入数据

-- 修改 profiles 插入策略
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

-- 修改 customers 插入策略
DROP POLICY IF EXISTS "customers_insert" ON customers;
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (true);

-- 修改 engineers 插入策略
DROP POLICY IF EXISTS "engineers_insert" ON engineers;
CREATE POLICY "engineers_insert" ON engineers FOR INSERT WITH CHECK (true);

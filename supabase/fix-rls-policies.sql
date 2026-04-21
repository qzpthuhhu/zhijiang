-- 修复RLS策略，确保用户只能访问自己的数据

-- 修复orders表的RLS策略
DROP POLICY IF EXISTS "orders_customer_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;

-- 订单选择策略：客户可以查看自己的订单，工程师可以查看分配给自己的订单，管理员可以查看所有
CREATE POLICY "orders_select" ON orders 
FOR SELECT 
USING (
  auth.uid() = customer_id OR 
  auth.uid() = assigned_engineer_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 订单插入策略：用户只能插入自己的订单
CREATE POLICY "orders_insert" ON orders 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- 订单更新策略：客户可以更新自己的订单，工程师可以更新分配给自己的订单，管理员可以更新所有
CREATE POLICY "orders_update" ON orders 
FOR UPDATE 
USING (
  auth.uid() = customer_id OR 
  auth.uid() = assigned_engineer_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 修复engineer_applications_log的RLS策略
DROP POLICY IF EXISTS "engineer_applications_log_select" ON engineer_applications_log;
DROP POLICY IF EXISTS "engineer_applications_log_insert" ON engineer_applications_log;

-- 工程师审核日志选择策略：工程师可以查看自己的日志，管理员可以查看所有
CREATE POLICY "engineer_applications_log_select" ON engineer_applications_log 
FOR SELECT 
USING (
  auth.uid() = engineer_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 工程师审核日志插入策略：只有管理员可以插入
CREATE POLICY "engineer_applications_log_insert" ON engineer_applications_log 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 修复payments的RLS策略
DROP POLICY IF EXISTS "payments_select" ON payments;
DROP POLICY IF EXISTS "payments_insert" ON payments;

-- 支付记录选择策略：客户可以查看自己订单的支付记录，工程师可以查看分配给自己订单的支付记录，管理员可以查看所有
CREATE POLICY "payments_select" ON payments 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND (orders.customer_id = auth.uid() OR orders.assigned_engineer_id = auth.uid())) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 支付记录插入策略：只有管理员可以插入
CREATE POLICY "payments_insert" ON payments 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 修复reviews的RLS策略
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;

-- 评价选择策略：评价者和被评价者可以查看评价，管理员可以查看所有
CREATE POLICY "reviews_select" ON reviews 
FOR SELECT 
USING (
  auth.uid() = reviewer_id OR 
  auth.uid() = reviewee_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 评价插入策略：用户只能插入自己的评价
CREATE POLICY "reviews_insert" ON reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- 验证策略
SELECT * FROM pg_policies WHERE tablename IN ('orders', 'engineer_applications_log', 'payments', 'reviews');

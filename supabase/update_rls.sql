-- 更新工程师表的RLS策略，允许管理员更新状态

-- 删除旧的更新策略
DROP POLICY IF EXISTS "engineers_update" ON engineers;

-- 创建新的更新策略，允许本人或管理员更新
CREATE POLICY "engineers_update" ON engineers 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 验证策略
SELECT * FROM pg_policies WHERE tablename = 'engineers';
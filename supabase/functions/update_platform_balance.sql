-- 创建更新平台余额的 RPC 函数
CREATE OR REPLACE FUNCTION update_platform_balance(amount DECIMAL(10, 2))
RETURNS void AS $$
BEGIN
  UPDATE platform_account
  SET balance = balance + amount,
      last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
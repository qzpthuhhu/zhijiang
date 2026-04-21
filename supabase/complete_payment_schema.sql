-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- payment, withdrawal, refund
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提现记录表
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  withdrawal_method VARCHAR(50),
  withdrawal_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 平台账户表
CREATE TABLE IF NOT EXISTS platform_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS payments_customer_id_idx ON payments(customer_id);
CREATE INDEX IF NOT EXISTS transactions_order_id_idx ON transactions(order_id);
CREATE INDEX IF NOT EXISTS transactions_from_user_id_idx ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS transactions_to_user_id_idx ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS withdrawals_engineer_id_idx ON withdrawals(engineer_id);

-- 插入初始平台账户
INSERT INTO platform_account (balance) VALUES (0) ON CONFLICT DO NOTHING;

-- 创建更新平台余额的 RPC 函数
CREATE OR REPLACE FUNCTION update_platform_balance(amount DECIMAL(10, 2))
RETURNS void AS $$
BEGIN
  UPDATE platform_account
  SET balance = balance + amount,
      last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS 策略
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_account ENABLE ROW LEVEL SECURITY;

-- payments 表 RLS 策略
CREATE POLICY "Customers can view own payments" ON payments
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Engineers can view payments for their orders" ON payments
  FOR SELECT USING (order_id IN (
    SELECT id FROM orders WHERE assigned_engineer_id = auth.uid()
  ));

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- transactions 表 RLS 策略
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- withdrawals 表 RLS 策略
CREATE POLICY "Engineers can view own withdrawals" ON withdrawals
  FOR SELECT USING (engineer_id = auth.uid());

CREATE POLICY "Admins can view all withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- platform_account 表 RLS 策略
CREATE POLICY "Admins can view platform account" ON platform_account
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- 为 orders 表添加 paid 状态
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';

-- 智匠智装 数据库建表SQL
-- 使用 Supabase PostgreSQL

-- 扩展 uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 表1: profiles (用户基本信息)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('customer', 'engineer', 'admin')) NOT NULL DEFAULT 'customer',
    display_name TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表2: customers (客户详细信息)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    customer_type TEXT CHECK (customer_type IN ('personal', 'enterprise')) DEFAULT 'personal',
    company_name TEXT,
    phone TEXT,
    wechat TEXT
);

-- 表3: engineers (工程师详细信息)
CREATE TABLE IF NOT EXISTS engineers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    engineer_status TEXT CHECK (engineer_status IN ('pending_review', 'approved', 'rejected')) DEFAULT 'pending_review',
    years_experience INTEGER,
    skills JSONB DEFAULT '[]'::jsonb,
    specialties JSONB DEFAULT '[]'::jsonb,
    bio TEXT,
    has_freelance_experience BOOLEAN DEFAULT FALSE,
    service_interests JSONB DEFAULT '[]'::jsonb,
    level TEXT CHECK (level IN ('junior', 'mid', 'senior')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表4: service_categories (服务分类)
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表5: service_packages (服务套餐)
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    target_users TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表6: orders (订单)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category_slug TEXT NOT NULL,
    package_slug TEXT NOT NULL,
    os TEXT,
    has_server BOOLEAN DEFAULT FALSE,
    contact TEXT NOT NULL,
    budget_range TEXT,
    description TEXT,
    is_enterprise BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    assigned_engineer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表7: order_messages (订单留言/沟通记录) - 预留扩展点
CREATE TABLE IF NOT EXISTS order_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表8: engineer_applications_log (工程师审核日志)
CREATE TABLE IF NOT EXISTS engineer_applications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engineer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表9: payments (支付记录) - 预留扩展点
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT,
    status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表10: reviews (评价系统) - 预留扩展点
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_engineers_status ON engineers(engineer_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_engineer ON orders(assigned_engineer_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineer_applications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- profiles 策略
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- customers 策略
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (auth.uid() = id);

-- engineers 策略
CREATE POLICY "engineers_select" ON engineers FOR SELECT USING (true);
CREATE POLICY "engineers_insert" ON engineers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "engineers_update" ON engineers FOR UPDATE USING (auth.uid() = id);

-- service_categories 策略
CREATE POLICY "service_categories_select" ON service_categories FOR SELECT USING (true);

-- service_packages 策略
CREATE POLICY "service_packages_select" ON service_packages FOR SELECT USING (true);

-- orders 策略
CREATE POLICY "orders_customer_select" ON orders FOR SELECT USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);

-- order_messages 策略
CREATE POLICY "order_messages_select" ON order_messages FOR SELECT USING (true);
CREATE POLICY "order_messages_insert" ON order_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- engineer_applications_log 策略
CREATE POLICY "engineer_applications_log_select" ON engineer_applications_log FOR SELECT USING (true);
CREATE POLICY "engineer_applications_log_insert" ON engineer_applications_log FOR INSERT WITH CHECK (true);

-- payments 策略
CREATE POLICY "payments_select" ON payments FOR SELECT USING (true);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);

-- reviews 策略
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);
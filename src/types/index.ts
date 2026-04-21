export type UserRole = 'customer' | 'engineer' | 'admin';
export type CustomerType = 'personal' | 'enterprise';
export type EngineerStatus = 'pending_review' | 'approved' | 'rejected';
export type EngineerLevel = 'junior' | 'mid' | 'senior';
export type OrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_type: CustomerType;
  company_name: string | null;
  phone: string | null;
  wechat: string | null;
}

export interface Engineer {
  id: string;
  engineer_status: EngineerStatus;
  years_experience: number | null;
  skills: string[];
  specialties: string[];
  bio: string | null;
  has_freelance_experience: boolean;
  service_interests: string[];
  level: EngineerLevel | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface ServicePackage {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  price: number;
  description: string | null;
  target_users: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  category_slug: string;
  package_slug: string;
  os: string | null;
  has_server: boolean | null;
  contact: string;
  budget_range: string | null;
  description: string | null;
  is_enterprise: boolean;
  status: OrderStatus;
  assigned_engineer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  customer?: Profile;
  engineer?: Profile;
  category?: ServiceCategory;
  package?: ServicePackage;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string | null;
  message: string;
  message_type: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string | null;
  amount: number;
  payment_method: string | null;
  status: PaymentStatus;
  transaction_id: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string | null;
  reviewer_id: string | null;
  reviewee_id: string | null;
  rating: number | null;
  content: string | null;
  created_at: string;
}

export interface EngineerApplicationLog {
  id: string;
  engineer_id: string;
  action: string;
  note: string | null;
  created_at: string;
}
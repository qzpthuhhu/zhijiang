'use server';

import { createBrowserClient } from "@supabase/ssr";
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

export async function registerUser(data: {
  email: string;
  password: string;
  displayName: string;
  role: 'customer' | 'engineer';
  customerType?: 'personal' | 'enterprise';
  companyName?: string;
  techDirection?: string;
  yearsExperience?: string;
  specialties?: string;
  bio?: string;
  hasFreelanceExperience?: boolean;
  serviceInterests?: string[];
}) {
  try {
    const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);

    console.log('Starting registration for:', data.email);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('注册失败：未能创建用户');
    }

    console.log('User created:', authData.user.id);

    const profileData = {
      id: authData.user.id,
      email: data.email,
      display_name: data.displayName,
      role: data.role,
    };

    const { error: profileError } = await supabase.from('profiles').insert(profileData);
    if (profileError) {
      console.error('Profile insert error:', profileError);
      throw new Error(profileError.message);
    }

    console.log('Profile created');

    if (data.role === 'customer') {
      const { error: customerError } = await supabase.from('customers').insert({
        id: authData.user.id,
        customer_type: data.customerType || 'personal',
        company_name: data.companyName || null,
      });
      if (customerError) {
        console.error('Customer insert error:', customerError);
        throw new Error(customerError.message);
      }
    } else if (data.role === 'engineer') {
      const { error: engineerError } = await supabase.from('engineers').insert({
        id: authData.user.id,
        engineer_status: 'pending_review',
        years_experience: parseInt(data.yearsExperience || '0') || null,
        specialties: data.specialties?.split(',').map(s => s.trim()).filter(Boolean) || [],
        bio: data.bio || null,
        has_freelance_experience: data.hasFreelanceExperience || false,
        service_interests: data.serviceInterests || [],
      });
      if (engineerError) {
        console.error('Engineer insert error:', engineerError);
        throw new Error(engineerError.message);
      }
    }

    revalidatePath('/');
    return { success: true, userId: authData.user.id };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: error.message || '注册失败，请重试' };
  }
}

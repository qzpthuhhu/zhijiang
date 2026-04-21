'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { User, Code } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'customer' | 'engineer' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    customerType: 'personal',
    companyName: '',
    techDirection: '',
    yearsExperience: '',
    specialties: '',
    bio: '',
    hasFreelanceExperience: false,
    serviceInterests: [] as string[],
  });

  const handleRoleSelect = (selectedRole: 'customer' | 'engineer') => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    try {
      console.log('Starting registration for:', formData.email);

      // 先尝试登录，检查用户是否已存在
      let user: any = null;
      let isNewUser = false;

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // 用户不存在，创建新用户
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
          });

          if (signUpError) {
            console.error('Sign up error:', signUpError);
            throw signUpError;
          }

          if (!signUpData.user) {
            throw new Error('注册失败：未能创建用户');
          }

          user = signUpData.user;
          isNewUser = true;
        } else {
          throw signInError;
        }
      } else {
        // 用户已存在
        user = signInData.user;
        isNewUser = false;
      }

      console.log('User found/created:', user.id, 'New user:', isNewUser);

      // 检查用户是否已有 profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (isNewUser || !existingProfile) {
        // 创建新的 profile
        const profileData = {
          id: user.id,
          email: formData.email,
          display_name: formData.displayName,
          role: role,
        };

        const { error: profileError } = await supabase.from('profiles').insert(profileData);
        if (profileError) {
          console.error('Profile insert error:', profileError);
          throw profileError;
        }

        console.log('Profile created');
      } else {
        // 更新现有 profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ display_name: formData.displayName })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }

        console.log('Profile updated');
      }

      // 检查并创建/更新客户或工程师记录
      if (role === 'customer') {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!existingCustomer) {
          const { error: customerError } = await supabase.from('customers').insert({
            id: user.id,
            customer_type: formData.customerType,
            company_name: formData.companyName || null,
          });
          if (customerError) {
            console.error('Customer insert error:', customerError);
            throw customerError;
          }
          console.log('Customer created');
        } else {
          const { error: customerError } = await supabase
            .from('customers')
            .update({
              customer_type: formData.customerType,
              company_name: formData.companyName || null,
            })
            .eq('id', user.id);
          if (customerError) {
            console.error('Customer update error:', customerError);
            throw customerError;
          }
          console.log('Customer updated');
        }
        router.push('/dashboard/customer');
      } else if (role === 'engineer') {
        const { data: existingEngineer } = await supabase
          .from('engineers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!existingEngineer) {
          const { error: engineerError } = await supabase.from('engineers').insert({
            id: user.id,
            engineer_status: 'pending_review',
            years_experience: parseInt(formData.yearsExperience) || null,
            specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
            bio: formData.bio || null,
            has_freelance_experience: formData.hasFreelanceExperience,
            service_interests: formData.serviceInterests,
          });
          if (engineerError) {
            console.error('Engineer insert error:', engineerError);
            throw engineerError;
          }
          console.log('Engineer created');
        } else {
          const { error: engineerError } = await supabase
            .from('engineers')
            .update({
              years_experience: parseInt(formData.yearsExperience) || null,
              specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
              bio: formData.bio || null,
              has_freelance_experience: formData.hasFreelanceExperience,
              service_interests: formData.serviceInterests,
            })
            .eq('id', user.id);
          if (engineerError) {
            console.error('Engineer update error:', engineerError);
            throw engineerError;
          }
          console.log('Engineer updated');
        }
        router.push('/engineer-pending');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">加入智匠智装</h1>
            <p className="text-slate-600">请选择您的身份</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => handleRoleSelect('customer')} className="text-left">
              <Card className="h-full transition-all hover:shadow-lg hover:border-slate-400 cursor-pointer border-2 border-transparent hover:border-slate-900">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-center">我是客户</CardTitle>
                  <CardDescription className="text-center">
                    寻找技术帮助的个人或企业
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• 浏览和购买技术服务</li>
                    <li>• 提交技术需求</li>
                    <li>• 跟踪订单进度</li>
                  </ul>
                </CardContent>
              </Card>
            </button>
            
            <button onClick={() => handleRoleSelect('engineer')} className="text-left">
              <Card className="h-full transition-all hover:shadow-lg hover:border-slate-400 cursor-pointer border-2 border-transparent hover:border-slate-900">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                    <Code className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-center">我是工程师</CardTitle>
                  <CardDescription className="text-center">
                    希望加入平台接单赚钱
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li>• 提交入驻申请</li>
                    <li>• 审核通过后接单</li>
                    <li>• 获得持续收入</li>
                  </ul>
                </CardContent>
              </Card>
            </button>
          </div>
          
          <p className="text-center mt-8 text-slate-600">
            已有账号？<Link href="/login" className="text-slate-900 underline">立即登录</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{role === 'customer' ? '客户注册' : '工程师注册'}</CardTitle>
            <CardDescription>
              {role === 'customer' ? '填写您的基本信息' : '填写您的技术背景'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              
              <div>
                <Label htmlFor="displayName">用户名</Label>
                <Input id="displayName" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} required />
              </div>
              
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              
              <div>
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
              </div>

              {role === 'customer' && (
                <>
                  <div>
                    <Label>用户类型</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input type="radio" name="customerType" value="personal" checked={formData.customerType === 'personal'} onChange={e => setFormData({...formData, customerType: e.target.value})} className="mr-2" />
                        个人
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="customerType" value="enterprise" checked={formData.customerType === 'enterprise'} onChange={e => setFormData({...formData, customerType: e.target.value})} className="mr-2" />
                        企业
                      </label>
                    </div>
                  </div>
                  {formData.customerType === 'enterprise' && (
                    <div>
                      <Label htmlFor="companyName">企业名称</Label>
                      <Input id="companyName" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    </div>
                  )}
                </>
              )}

              {role === 'engineer' && (
                <>
                  <div>
                    <Label htmlFor="techDirection">技术方向</Label>
                    <Input id="techDirection" placeholder="如：前端开发、AI 应用" value={formData.techDirection} onChange={e => setFormData({...formData, techDirection: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">工作年限</Label>
                    <Input id="yearsExperience" type="number" placeholder="如：5" value={formData.yearsExperience} onChange={e => setFormData({...formData, yearsExperience: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="specialties">擅长领域（逗号分隔）</Label>
                    <Input id="specialties" placeholder="如：React, Node.js, Python" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="bio">个人简介</Label>
                    <textarea id="bio" className="w-full min-h-[80px] p-3 border rounded-md" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" checked={formData.hasFreelanceExperience} onChange={e => setFormData({...formData, hasFreelanceExperience: e.target.checked})} className="mr-2" />
                      有接单经验
                    </label>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-4 text-slate-600">
          <button onClick={() => setStep('role')} className="underline">返回重新选择</button>
        </p>
      </div>
    </div>
  );
}
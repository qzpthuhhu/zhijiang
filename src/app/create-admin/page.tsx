'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';

export default function CreateAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: 'admin@zhijiang.com',
    password: 'admin123456',
    displayName: '系统管理员',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const supabase = createClient();

    try {
      // 1. 创建用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('创建用户失败');
      }

      // 2. 创建管理员 profile
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        display_name: formData.displayName,
        role: 'admin' as const,
      };

      const { error: profileError } = await supabase.from('profiles').insert(profileData);
      if (profileError) {
        console.error('Profile insert error:', profileError);
        throw profileError;
      }

      setSuccess('管理员账号创建成功！');
      
      // 3. 延迟后跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error('Creation error:', err);
      setError(err.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>创建管理员账号</CardTitle>
            <CardDescription>创建系统管理员账号以访问管理后台</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded">{success}</div>}
              
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              
              <div>
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
              </div>
              
              <div>
                <Label htmlFor="displayName">用户名</Label>
                <Input id="displayName" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '创建中...' : '创建管理员账号'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-slate-600">
          已有账号？<a href="/login" className="text-slate-900 underline">立即登录</a>
        </p>
      </div>
    </div>
  );
}
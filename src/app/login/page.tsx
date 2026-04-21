'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { User, Code } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success] = useState(searchParams.get('reset') === 'success');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState<'customer' | 'engineer'>('customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    try {
      console.log('Attempting login for:', formData.email);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        
        if (authError.message.includes('Email not confirmed')) {
          setError('请先确认您的邮箱！登录您的注册邮箱，点击确认链接完成验证。');
        } else {
          setError(authError.message || '登录失败，请检查邮箱和密码');
        }
        setLoading(false);
        return;
      }

      console.log('Login successful, user:', data.user.id);

      // 根据用户选择的角色跳转
      if (role === 'engineer') {
        router.push('/dashboard/engineer');
      } else {
        router.push('/dashboard/customer');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>登录您的智匠智装账号</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded">密码已重置成功，请使用新密码登录。</div>}
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              
              <div>
                <Label>登录身份</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-md ${role === 'customer' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}
                  >
                    <User className="w-4 h-4" />
                    <span>我是客户</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('engineer')}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-md ${role === 'engineer' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}
                  >
                    <Code className="w-4 h-4" />
                    <span>我是工程师</span>
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              
              <div>
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link href="/forgot-password" className="text-slate-600 hover:text-slate-900 underline">
            忘记密码？
          </Link>
          <Link href="/register" className="text-slate-600 hover:text-slate-900 underline">
            还没有账号？立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">加载中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
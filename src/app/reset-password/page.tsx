'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // 如果没有 code 参数，显示输入邮箱的表单
    if (!code) {
      setIsChecking(false);
      setIsValid(true); // 显示邮箱输入表单
      return;
    }

    // 有 code 参数时，直接验证通过（服务端会处理验证）
    setIsValid(true);
    setIsChecking(false);
  }, [code]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?next=true`,
      });

      if (resetError) {
        setError(resetError.message || '发送失败，请稍后重试');
      } else {
        alert('重置链接已发送到您的邮箱，请查收。');
      }
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 个字符');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('请先输入您的邮箱地址');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '更新密码失败，请稍后重试');
        setLoading(false);
        return;
      }

      router.push('/login?reset=success');
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || '更新密码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="container py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">验证中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 如果没有 code，显示"申请重置"表单
  if (!code) {
    return (
      <div className="container py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>申请密码重置</CardTitle>
              <CardDescription>输入您的注册邮箱，我们会发送密码重置链接</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestCode} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="requestEmail">邮箱地址</Label>
                  <Input
                    id="requestEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '发送中...' : '发送重置链接'}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                  返回登录
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 有 code 参数，显示设置新密码表单
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>设置新密码</CardTitle>
            <CardDescription>输入您的新密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">注册邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">新密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 个字符"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '更新中...' : '更新密码'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}

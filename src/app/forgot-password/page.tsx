'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const supabase = createClient();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?next=true`,
      });

      if (resetError) {
        console.error('Reset password error:', resetError);
        setError(resetError.message || '发送重置邮件失败，请稍后重试');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || '发送重置邮件失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>忘记密码</CardTitle>
            <CardDescription>输入您的注册邮箱，我们会发送密码重置链接</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">重置邮件已发送！</p>
                    <p className="text-sm mt-1">请登录您的邮箱，点击邮件中的链接来重置密码。</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  如果没有收到邮件，请检查垃圾邮件文件夹，或确认邮箱地址是否正确。
                </p>
                <Button variant="outline" className="w-full" onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}>
                  重新发送
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

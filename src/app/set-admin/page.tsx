'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export default function SetAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
    supabase.auth.getUser().then(({ data }: any) => {
      if (data.user) {
        setUser(data.user);
        setEmail(data.user.email || '');
      }
    });
  }, []);

  const handleSetAdmin = async () => {
    if (!email) {
      setMessage('请输入邮箱地址');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);

      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', email);

      if (error) {
        setMessage('设置失败: ' + error.message);
      } else {
        setMessage('设置成功！请重新登录使更改生效。');
        
        await supabase.auth.signOut();
        router.push('/login');
      }
    } catch (err: any) {
      setMessage('错误: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">设置管理员</h1>
          <p className="text-slate-600">将你的账号设置为管理员</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          {user && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
              当前登录: {user.email}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="输入要设置为管理员的邮箱"
            />
          </div>

          <button
            onClick={handleSetAdmin}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? '设置中...' : '设为管理员'}
          </button>

          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/admin" className="text-blue-600 hover:underline">
            前往管理后台
          </a>
        </div>
      </div>
    </div>
  );
}
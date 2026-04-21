'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export default function TestPage() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setMessage('正在测试连接...');

    try {
      const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
      
      setMessage('连接成功！');
      
      // 测试获取用户列表（需要适当的权限）
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        setMessage('获取用户列表失败: ' + error.message);
      } else {
        setUsers(authUsers.users || []);
        setMessage(`找到 ${authUsers.users?.length || 0} 个用户`);
      }
    } catch (err: any) {
      setMessage('测试失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Supabase 测试</h1>
          <p className="text-slate-600">测试 Supabase 连接和用户状态</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">测试结果</h2>
            <div className={`p-3 rounded ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
              {loading ? '加载中...' : message}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">用户列表</h2>
            {users.length > 0 ? (
              <ul className="space-y-2">
                {users.map((user, index) => (
                  <li key={user.id} className="p-2 border rounded">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                    <div className="text-sm text-gray-500">确认: {user.email_confirmed_at ? '是' : '否'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 bg-gray-50 text-gray-600 rounded">
                没有找到用户
              </div>
            )}
          </div>

          <button
            onClick={testConnection}
            disabled={loading}
            className="mt-6 w-full bg-slate-900 text-white py-2 px-4 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? '测试中...' : '重新测试'}
          </button>
        </div>
      </div>
    </div>
  );
}
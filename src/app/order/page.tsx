'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';

function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    categorySlug: searchParams.get('service') || '',
    packageSlug: searchParams.get('package') || '',
    os: '',
    hasServer: false,
    contact: '',
    contactMethod: 'wechat',
    budgetRange: '',
    description: '',
    isEnterprise: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login?redirect=/order');
      } else {
        setUser(data.user);
      }
    });
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase.from('orders').insert({
        customer_id: user.id,
        category_slug: formData.categorySlug,
        package_slug: formData.categorySlug === 'custom' ? 'custom-service' : formData.packageSlug,
        os: formData.os,
        has_server: formData.hasServer,
        contact: formData.contact,
        budget_range: formData.budgetRange,
        description: formData.description,
        is_enterprise: formData.isEnterprise,
        status: 'pending',
      }).select();

      if (insertError) throw insertError;
      router.push('/success');
    } catch (err: any) {
      setError(err.message || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = [
    { value: 'openclaw', label: 'OpenClaw 安装部署' },
    { value: 'claude-code', label: 'Claude Code 配置' },
    { value: 'vibe-coding', label: 'Vibe Coding 大师答疑' },
    { value: 'rag', label: 'RAG 方案与部署' },
    { value: 'multi-agent', label: '多 Agent 系统' },
    { value: 'custom', label: '自定义 AI & Coding 服务' },
  ];

  const packageOptions: Record<string, { value: string; label: string }[]> = {
    'openclaw': [
      { value: 'openclaw-basic', label: '基础安装 ¥299' },
      { value: 'openclaw-pro', label: '进阶部署 ¥999' },
      { value: 'openclaw-enterprise', label: '企业部署 ¥4999' },
    ],
    'claude-code': [
      { value: 'claude-code-quick', label: '快速接入 ¥199' },
      { value: 'claude-code-advanced', label: '高级配置 ¥599' },
      { value: 'claude-code-team', label: '团队方案 ¥2999' },
    ],
    'vibe-coding': [
      { value: 'vibe-single', label: '单次答疑 ¥199' },
      { value: 'vibe-deep', label: '1小时深度指导 ¥499' },
      { value: 'vibe-accompany', label: '项目陪跑 ¥1999' },
    ],
    'rag': [
      { value: 'rag-consult', label: 'RAG 咨询答疑 ¥299' },
      { value: 'rag-demo', label: 'RAG Demo 搭建 ¥1999' },
      { value: 'rag-enterprise', label: '企业知识库方案 ¥9999' },
    ],
    'multi-agent': [
      { value: 'multi-agent-consult', label: '架构答疑 ¥399' },
      { value: 'multi-agent-demo', label: 'Demo 搭建 ¥2999' },
      { value: 'multi-agent-enterprise', label: '企业多智能体方案 ¥19999' },
    ],
  };

  if (!user) {
    return <div className="container py-12 text-center">正在检查登录状态...</div>;
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-lg mx-auto">
        <Link href="/services" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回服务专区
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>提交需求</CardTitle>
            <CardDescription>填写您的技术需求，平台将为您匹配合适的工程师</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
              
              <div>
                <Label>服务分区</Label>
                <select 
                  className="w-full h-10 border rounded-md px-3"
                  value={formData.categorySlug}
                  onChange={e => setFormData({...formData, categorySlug: e.target.value, packageSlug: ''})}
                  required
                >
                  <option value="">请选择服务类型</option>
                  {serviceOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>

              {formData.categorySlug && formData.categorySlug !== 'custom' && (
                <div>
                  <Label>服务套餐</Label>
                  <select 
                    className="w-full h-10 border rounded-md px-3"
                    value={formData.packageSlug}
                    onChange={e => setFormData({...formData, packageSlug: e.target.value})}
                    required
                  >
                    <option value="">请选择套餐</option>
                    {packageOptions[formData.categorySlug]?.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
              )}

              {formData.categorySlug === 'custom' && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    您选择了自定义服务，请在需求描述中详细说明您的具体需求，我们会根据实际情况提供报价。
                  </p>
                </div>
              )}

              <div>
                <Label>操作系统</Label>
                <select 
                  className="w-full h-10 border rounded-md px-3"
                  value={formData.os}
                  onChange={e => setFormData({...formData, os: e.target.value})}
                  required
                >
                  <option value="">请选择</option>
                  <option value="Windows">Windows</option>
                  <option value="Mac">Mac</option>
                  <option value="Linux">Linux</option>
                  <option value="服务器">服务器</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formData.hasServer}
                    onChange={e => setFormData({...formData, hasServer: e.target.checked})}
                    className="mr-2" 
                  />
                  已有服务器
                </label>
              </div>

              <div>
                <Label>联系方式</Label>
                <Input 
                  placeholder="微信号/手机号/邮箱" 
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>预算范围</Label>
                <select 
                  className="w-full h-10 border rounded-md px-3"
                  value={formData.budgetRange}
                  onChange={e => setFormData({...formData, budgetRange: e.target.value})}
                >
                  <option value="">请选择</option>
                  <option value="500以下">500 元以下</option>
                  <option value="500-1000">500-1000 元</option>
                  <option value="1000-3000">1000-3000 元</option>
                  <option value="3000-10000">3000-10000 元</option>
                  <option value="10000以上">10000 元以上</option>
                  <option value="暂定">暂定</option>
                </select>
              </div>

              <div>
                <Label>需求描述</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  placeholder="请详细描述您的需求..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formData.isEnterprise}
                    onChange={e => setFormData({...formData, isEnterprise: e.target.checked})}
                    className="mr-2" 
                  />
                  企业项目
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '提交中...' : '提交需求'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center">加载中...</div>}>
      <OrderForm />
    </Suspense>
  );
}
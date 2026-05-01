'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle, XCircle, PlayCircle, Users, Package, Search, Plus } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待处理', color: 'text-yellow-600', icon: Clock },
  assigned: { label: '已指派', color: 'text-blue-600', icon: PlayCircle },
  in_progress: { label: '处理中', color: 'text-blue-600', icon: PlayCircle },
  completed: { label: '已完成', color: 'text-green-600', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-red-600', icon: XCircle },
};

export default function CustomerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [engineerProfiles, setEngineerProfiles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'customer') {
          router.push('/');
          return;
        }

        // 并行加载数据
        const [orderResult, engineerResult] = await Promise.all([
          // 加载订单
          supabase
            .from('orders')
            .select('*')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false }),
          // 加载已认证的工程师
          supabase
            .from('engineers')
            .select('*')
            .eq('engineer_status', 'approved')
        ]);

        const orderData = orderResult.data || [];
        const engineerData = engineerResult.data || [];

        // 加载工程师的个人资料
        const engineerIds = engineerData.map((e: any) => e.id);
        let profileData = [];
        if (engineerIds.length > 0) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .in('id', engineerIds);
          profileData = data || [];
        }

        setOrders(orderData);
        setEngineers(engineerData);
        setEngineerProfiles(profileData);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  const getEngineerProfile = (engineerId: string) => {
    return engineerProfiles.find(p => p.id === engineerId);
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">客户工作台</h1>
        <Link href="/order">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            提交新需求
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">处理中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {orders.filter(o => o.status === 'in_progress' || o.status === 'assigned').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">我的需求</TabsTrigger>
          <TabsTrigger value="engineers">工程师列表</TabsTrigger>
          <TabsTrigger value="services">服务浏览</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>我的需求</CardTitle>
              <CardDescription>查看和管理您提交的技术需求</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无需求，<Link href="/order" className="text-blue-600 hover:underline">提交新需求</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = statusMap[order.status] || { label: order.status, color: 'text-slate-600', icon: Clock };
                    return (
                      <Link href={`/order/${order.id}`} key={order.id} className="block">
                        <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-slate-900">{order.category_slug}</p>
                              <p className="text-sm text-slate-500">{order.package_slug}</p>
                            </div>
                            <div className={`flex items-center gap-2 ${status.color}`}>
                              <status.icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{status.label}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{order.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{new Date(order.created_at).toLocaleString('zh-CN')}</span>
                            <span className="text-blue-600">查看详情</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engineers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>工程师列表</CardTitle>
              <CardDescription>浏览平台认证的工程师</CardDescription>
            </CardHeader>
            <CardContent>
              {engineers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无认证工程师
                </div>
              ) : (
                <div className="space-y-4">
                  {engineers.map((engineer) => {
                    const profile = getEngineerProfile(engineer.id);
                    return (
                      <div key={engineer.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{profile?.display_name || '未设置昵称'}</p>
                            <p className="text-sm text-slate-500">{profile?.email}</p>
                            <p className="text-sm text-slate-500">工作年限: {engineer.years_experience} 年</p>
                            <p className="text-sm text-slate-500">擅长: {engineer.specialties?.join(', ') || '未填写'}</p>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            已认证
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>服务浏览</CardTitle>
              <CardDescription>查看平台提供的技术服务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">服务分类</h3>
                <p className="text-slate-500 mb-6">浏览我们的技术服务分类</p>
                <Link href="/services">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    浏览服务
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
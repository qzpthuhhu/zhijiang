'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle, XCircle, PlayCircle, Users, MessageSquare, Calendar } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待处理', color: 'text-yellow-600', icon: Clock },
  assigned: { label: '已指派', color: 'text-blue-600', icon: PlayCircle },
  in_progress: { label: '处理中', color: 'text-blue-600', icon: PlayCircle },
  completed: { label: '已完成', color: 'text-green-600', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-red-600', icon: XCircle },
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [engineerProfiles, setEngineerProfiles] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileData) {
          router.push('/');
          return;
        }
        setProfile(profileData);

        if (profileData.role === 'customer') {
          // 并行加载订单和工程师数据
          const [orderResult, engineerResult] = await Promise.all([
            // 客户：加载已提交的订单
            supabase
              .from('orders')
              .select('*')
              .eq('customer_id', user.id)
              .order('created_at', { ascending: false }),
            // 客户：加载联系过的工程师
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
        } else if (profileData.role === 'engineer') {
          // 工程师：加载已接单的订单
          const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('assigned_engineer_id', user.id)
            .order('created_at', { ascending: false });

          // 工程师：加载联系过的客户
          const customerIds = orderData?.map((o: any) => o.customer_id) || [];
          let customerData = [];
          if (customerIds.length > 0) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .in('id', customerIds);
            customerData = data || [];
          }

          setOrders(orderData || []);
          setContacts(customerData);
        }

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

  if (!profile) {
    return <div className="container py-12 text-center">用户信息不存在</div>;
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">个人中心</h1>
        <Link href={profile.role === 'customer' ? '/dashboard/customer' : '/dashboard/engineer'}>
          <Button>返回工作台</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>查看您的账户信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">用户名</p>
              <p className="font-medium">{profile.display_name || '未设置'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">邮箱</p>
              <p>{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">角色</p>
              <p>{profile.role === 'customer' ? '客户' : '工程师'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">注册时间</p>
              <p>{new Date(profile.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">历史记录</TabsTrigger>
          <TabsTrigger value="contacts">联系记录</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>历史记录</CardTitle>
              <CardDescription>
                {profile.role === 'customer' ? '您提交的技术需求' : '您接取的任务'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {profile.role === 'customer' ? '暂无提交的需求' : '暂无接取的任务'}
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
        
        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>联系记录</CardTitle>
              <CardDescription>
                {profile.role === 'customer' ? '您联系过的工程师' : '您服务过的客户'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.role === 'customer' ? (
                engineers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    暂无联系过的工程师
                  </div>
                ) : (
                  <div className="space-y-4">
                    {engineers.map((engineer) => {
                      const engineerProfile = getEngineerProfile(engineer.id);
                      return (
                        <div key={engineer.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{engineerProfile?.display_name || '未设置昵称'}</p>
                              <p className="text-sm text-slate-500">{engineerProfile?.email}</p>
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
                )
              ) : (
                contacts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    暂无服务过的客户
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{contact.display_name || '未设置昵称'}</p>
                            <p className="text-sm text-slate-500">{contact.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
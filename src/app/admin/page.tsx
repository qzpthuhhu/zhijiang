'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { Package, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'engineers' | 'reviews'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [engineerProfiles, setEngineerProfiles] = useState<any[]>([]);
  const [approvedEngineers, setApprovedEngineers] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('Auth error:', authError);
          router.push('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          console.error('Profile error:', profileError);
          router.push('/');
          return;
        }

        await loadData();
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [supabase, router]);

  const loadData = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: engineerData } = await supabase
      .from('engineers')
      .select('*')
      .order('created_at', { ascending: false });

    const engineerIds = engineerData?.map((e: any) => e.id) || [];
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', engineerIds.length > 0 ? engineerIds : ['empty']);

    setOrders(ordersData || []);
    setEngineers(engineerData || []);
    setEngineerProfiles(profileData || []);
    setApprovedEngineers(engineerData?.filter((e: any) => e.engineer_status === 'approved') || []);
  };

  const handleReviewEngineer = async (engineerId: string, action: 'approved' | 'rejected') => {
    try {
      // 先更新工程师状态
      const { error: updateError } = await supabase
        .from('engineers')
        .update({ engineer_status: action, updated_at: new Date().toISOString() })
        .eq('id', engineerId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // 记录审核日志（如果表存在）
      try {
        await supabase.from('engineer_applications_log').insert({
          engineer_id: engineerId,
          action: action,
          note: action === 'approved' ? '审核通过' : '审核拒绝',
        });
      } catch (logError) {
        console.warn('Log insert error (table might not exist):', logError);
      }

      // 重新加载数据
      await loadData();
    } catch (error) {
      console.error('Review error:', error);
      alert('审核操作失败，请重试');
    }
  };

  const handleAssignEngineer = async (orderId: string, engineerId: string) => {
    await supabase
      .from('orders')
      .update({ status: 'assigned', assigned_engineer_id: engineerId, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    loadData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    loadData();
  };

  const getProfile = (id: string) => engineerProfiles.find(p => p.id === id);
  const getEngineerProfile = (id: string) => engineers.find(e => e.id === id);

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  const pendingEngineers = engineers.filter(e => e.engineer_status === 'pending_review');
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">管理后台</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
            <Clock className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待审核工程师</CardTitle>
            <Users className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEngineers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已认证工程师</CardTitle>
            <CheckCircle className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedEngineers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总订单数</CardTitle>
            <Package className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'orders' ? 'default' : 'outline'} onClick={() => setActiveTab('orders')}>
          订单管理
        </Button>
        <Button variant={activeTab === 'engineers' ? 'default' : 'outline'} onClick={() => setActiveTab('engineers')}>
          工程师审核
        </Button>
      </div>

      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>订单列表</CardTitle>
            <CardDescription>管理所有客户订单</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center py-8 text-slate-500">暂无订单</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{order.category_slug} / {order.package_slug}</p>
                        <p className="text-sm text-slate-500">{order.description}</p>
                        <p className="text-xs text-slate-400">联系方式: {order.contact}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status === 'pending' ? '待处理' :
                           order.status === 'assigned' ? '已指派' :
                           order.status === 'in_progress' ? '处理中' :
                           order.status === 'completed' ? '已完成' : '已取消'}
                        </span>
                        {order.status === 'pending' && (
                          <select
                            className="text-sm border rounded px-2 py-1"
                            onChange={(e) => handleAssignEngineer(order.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>指派工程师</option>
                            {approvedEngineers.map(eng => (
                              <option key={eng.id} value={eng.id}>
                                {getProfile(eng.id)?.display_name || eng.id}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'engineers' && (
        <div className="space-y-6">
          {pendingEngineers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>待审核工程师</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEngineers.map((engineer) => {
                    const profile = getProfile(engineer.id);
                    return (
                      <div key={engineer.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{profile?.display_name || '未设置昵称'}</p>
                            <p className="text-sm text-slate-500">{profile?.email}</p>
                            <p className="text-sm text-slate-500">工作年限: {engineer.years_experience} 年</p>
                            <p className="text-sm text-slate-500">擅长: {engineer.specialties?.join(', ') || '未填写'}</p>
                            <p className="text-sm text-slate-500 mt-2">简介: {engineer.bio || '未填写'}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReviewEngineer(engineer.id, 'approved')}>
                              <CheckCircle className="w-4 h-4 mr-1" /> 通过
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReviewEngineer(engineer.id, 'rejected')}>
                              <XCircle className="w-4 h-4 mr-1" /> 拒绝
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>工程师列表</CardTitle>
            </CardHeader>
            <CardContent>
              {engineers.length === 0 ? (
                <p className="text-center py-8 text-slate-500">暂无工程师</p>
              ) : (
                <div className="space-y-4">
                  {engineers.map((engineer) => {
                    const profile = getProfile(engineer.id);
                    return (
                      <div key={engineer.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{profile?.display_name || '未设置昵称'}</p>
                            <p className="text-sm text-slate-500">{profile?.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            engineer.engineer_status === 'approved' ? 'bg-green-100 text-green-800' :
                            engineer.engineer_status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {engineer.engineer_status === 'approved' ? '已认证' :
                             engineer.engineer_status === 'pending_review' ? '待审核' : '已拒绝'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
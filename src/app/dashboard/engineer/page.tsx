'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle, XCircle, PlayCircle, AlertCircle, User, Package, Edit3, Search, Handshake } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待处理', color: 'text-yellow-600', icon: Clock },
  assigned: { label: '已指派', color: 'text-blue-600', icon: PlayCircle },
  in_progress: { label: '处理中', color: 'text-blue-600', icon: PlayCircle },
  completed: { label: '已完成', color: 'text-green-600', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-red-600', icon: XCircle },
};

export default function EngineerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [engineer, setEngineer] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    techDirection: '',
    yearsExperience: '',
    specialties: '',
    bio: '',
    hasFreelanceExperience: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }

        // 并行加载个人资料和工程师信息
        const [profileResult, engineerResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
          supabase
            .from('engineers')
            .select('*')
            .eq('id', user.id)
            .single()
        ]);

        const profileData = profileResult.data;
        const engineerData = engineerResult.data;

        if (!profileData || profileData?.role !== 'engineer') {
          router.push('/');
          return;
        }
        setProfile(profileData);
        setEngineer(engineerData);

        if (engineerData) {
          setFormData({
            displayName: profileData.display_name || '',
            techDirection: '',
            yearsExperience: engineerData.years_experience?.toString() || '',
            specialties: engineerData.specialties?.join(', ') || '',
            bio: engineerData.bio || '',
            hasFreelanceExperience: engineerData.has_freelance_experience || false,
          });
        }

        if (engineerData?.engineer_status === 'pending_review') {
          setLoading(false);
          return;
        }

        if (engineerData?.engineer_status === 'approved') {
          // 并行加载订单数据
          const [orderResult, availableOrderResult] = await Promise.all([
            // 加载已分配的订单
            supabase
              .from('orders')
              .select('*')
              .eq('assigned_engineer_id', user.id)
              .order('created_at', { ascending: false }),
            // 加载可接单的订单（待处理状态）
            supabase
              .from('orders')
              .select('*')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
          ]);

          const orderData = orderResult.data || [];
          const availableOrderData = availableOrderResult.data || [];

          setOrders(orderData);
          setAvailableOrders(availableOrderData);
          setFilteredOrders(availableOrderData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    // 筛选可接单的订单
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = availableOrders.filter(order => 
        (order.category_slug?.toLowerCase() || '').includes(term) ||
        (order.package_slug?.toLowerCase() || '').includes(term) ||
        (order.description?.toLowerCase() || '').includes(term)
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(availableOrders);
    }
  }, [availableOrders, searchTerm]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleTakeOrder = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('orders')
        .update({
          status: 'assigned',
          assigned_engineer_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // 重新加载数据
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('assigned_engineer_id', user.id)
        .order('created_at', { ascending: false });

      const { data: availableOrderData } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setOrders(orderData || []);
      setAvailableOrders(availableOrderData || []);
      setFilteredOrders(availableOrderData || []);
    } catch (error) {
      console.error('Take order error:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // 更新个人资料
      await supabase
        .from('profiles')
        .update({ display_name: formData.displayName })
        .eq('id', profile.id);

      // 更新工程师资料
      await supabase
        .from('engineers')
        .update({
          years_experience: parseInt(formData.yearsExperience) || null,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
          bio: formData.bio,
          has_freelance_experience: formData.hasFreelanceExperience,
          updated_at: new Date().toISOString()
        })
        .eq('id', engineer.id);

      // 重新加载数据
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();

      const { data: engineerData } = await supabase
        .from('engineers')
        .select('*')
        .eq('id', engineer.id)
        .single();

      setProfile(profileData);
      setEngineer(engineerData);
      setEditMode(false);
    } catch (error) {
      console.error('Save profile error:', error);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  if (engineer?.engineer_status === 'pending_review') {
    return (
      <div className="container py-12">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">审核中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">您的工程师申请正在审核中，请耐心等待。</p>
            <p className="text-sm text-slate-500">审核预计需要 1-3 个工作日</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (engineer?.engineer_status === 'rejected') {
    return (
      <div className="container py-12">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">审核未通过</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">抱歉，您的工程师申请未通过审核。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">工程师工作台</h1>
        <div className="flex items-center gap-2">
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> 已认证
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {orders.filter(o => o.status === 'assigned').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {orders.filter(o => o.status === 'in_progress').length}
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

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">需求浏览</TabsTrigger>
          <TabsTrigger value="orders">我的订单</TabsTrigger>
          <TabsTrigger value="profile">个人信息</TabsTrigger>
          <TabsTrigger value="services">服务管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>可接单需求</CardTitle>
              <CardDescription>浏览并接取客户提交的技术需求</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input 
                    placeholder="搜索需求..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无可接订单
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    return (
                      <div key={order.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900">{order.category_slug}</p>
                            <p className="text-sm text-slate-500">{order.package_slug}</p>
                          </div>
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            待处理
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{order.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                          <span>{new Date(order.created_at).toLocaleString('zh-CN')}</span>
                          <span>预算: {order.budget_range}</span>
                        </div>
                        <Button onClick={() => handleTakeOrder(order.id)}>
                          <Handshake className="w-4 h-4 mr-2" />
                          接单
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>我的订单</CardTitle>
              <CardDescription>查看分配给您的订单</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无分配订单
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = statusMap[order.status] || { label: order.status, color: 'text-slate-600', icon: Clock };
                    return (
                      <div key={order.id} className="p-4 border rounded-lg">
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
                        <p className="text-sm text-slate-600 mb-3">{order.description}</p>
                        <div className="flex gap-2">
                          {order.status === 'assigned' && (
                            <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'in_progress')}>
                              开始处理
                            </Button>
                          )}
                          {order.status === 'in_progress' && (
                            <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                              完成订单
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>管理您的个人资料和专业信息</CardDescription>
              </div>
              <Button size="sm" onClick={() => setEditMode(!editMode)}>
                <Edit3 className="w-4 h-4 mr-2" />
                {editMode ? '取消' : '编辑'}
              </Button>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">用户名</Label>
                    <Input 
                      id="displayName" 
                      value={formData.displayName} 
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">工作年限</Label>
                    <Input 
                      id="yearsExperience" 
                      type="number" 
                      value={formData.yearsExperience} 
                      onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialties">擅长领域（逗号分隔）</Label>
                    <Input 
                      id="specialties" 
                      value={formData.specialties} 
                      onChange={(e) => setFormData({...formData, specialties: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">个人简介</Label>
                    <Textarea 
                      id="bio" 
                      value={formData.bio} 
                      onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData.hasFreelanceExperience} 
                        onChange={(e) => setFormData({...formData, hasFreelanceExperience: e.target.checked})} 
                        className="mr-2"
                      />
                      有接单经验
                    </label>
                  </div>
                  <Button onClick={handleSaveProfile}>
                    保存修改
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">用户名</p>
                      <p className="text-slate-600">{profile?.display_name || '未设置'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">邮箱</p>
                      <p className="text-slate-600">{profile?.email || '未设置'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">工作年限</p>
                      <p className="text-slate-600">{engineer?.years_experience || '未设置'} 年</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">擅长领域</p>
                      <p className="text-slate-600">{engineer?.specialties?.join(', ') || '未设置'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">个人简介</p>
                      <p className="text-slate-600">{engineer?.bio || '未设置'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">接单经验</p>
                      <p className="text-slate-600">{engineer?.has_freelance_experience ? '有' : '无'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>服务管理</CardTitle>
              <CardDescription>管理您提供的技术服务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">服务管理</h3>
                <p className="text-slate-500 mb-6">管理您提供的技术服务</p>
                <Button disabled>
                  服务管理功能开发中
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Clock, CheckCircle, XCircle, PlayCircle, Send, User } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待处理', color: 'text-yellow-600', icon: Clock },
  assigned: { label: '已指派', color: 'text-blue-600', icon: PlayCircle },
  in_progress: { label: '处理中', color: 'text-blue-600', icon: PlayCircle },
  completed: { label: '已完成', color: 'text-green-600', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-red-600', icon: XCircle },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 获取用户信息
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push('/login');
          return;
        }
        setUser(authUser);

        // 获取用户资料
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData);

        // 获取订单信息
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        setOrder(orderData);

        // 获取订单消息
        const { data: messagesData } = await supabase
          .from('order_messages')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: true });
        setMessages(messagesData || []);

        setLoading(false);

        // 设置实时订阅
        const subscription = supabase
          .channel('order-messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'order_messages',
            filter: `order_id=eq.${id}`
          }, (payload) => {
            setMessages(prev => [...prev, payload.new]);
          })
          .subscribe();

        // 清理订阅
        return () => {
          supabase.removeChannel(subscription);
        };
      } catch (error) {
        console.error('Error loading order:', error);
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [supabase, router, id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !order) return;

    setMessageLoading(true);
    try {
      const { data: newMessage } = await supabase
        .from('order_messages')
        .insert({
          order_id: order.id,
          sender_id: user.id,
          message: message.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (newMessage) {
        setMessages([...messages, newMessage]);
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', order.id);

      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  if (!order) {
    return <div className="container py-12 text-center">订单不存在</div>;
  }

  const status = statusMap[order.status] || { label: order.status, color: 'text-slate-600', icon: Clock };
  const isCustomer = profile?.role === 'customer' && order.customer_id === user.id;
  const isEngineer = profile?.role === 'engineer' && order.assigned_engineer_id === user.id;
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <Link href={isCustomer ? '/dashboard/customer' : isEngineer ? '/dashboard/engineer' : '/admin'} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回工作台
        </Link>

        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>订单详情</CardTitle>
              <CardDescription>订单 ID: {order.id}</CardDescription>
            </div>
            <div className={`flex items-center gap-2 ${status.color}`}>
              <status.icon className="w-4 h-4" />
              <span className="font-medium">{status.label}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">服务类型</p>
                  <p className="font-medium">{order.category_slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">套餐</p>
                  <p>{order.package_slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">操作系统</p>
                  <p>{order.os}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">已有服务器</p>
                  <p>{order.has_server ? '是' : '否'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">联系方式</p>
                  <p>{order.contact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">预算范围</p>
                  <p>{order.budget_range}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-slate-500">需求描述</p>
                  <p className="whitespace-pre-wrap">{order.description}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-slate-500">创建时间</p>
                  <p>{new Date(order.created_at).toLocaleString('zh-CN')}</p>
                </div>
              </div>

              {(isEngineer || isAdmin) && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">订单操作</h3>
                  <div className="flex gap-2">
                    {order.status === 'assigned' && (
                      <Button size="sm" onClick={() => handleUpdateStatus('in_progress')}>
                        开始处理
                      </Button>
                    )}
                    {order.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleUpdateStatus('completed')}>
                        完成订单
                      </Button>
                    )}
                    {isAdmin && order.status === 'pending' && (
                      <Button size="sm">
                        指派工程师
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {isCustomer && order.status === 'pending' && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">订单操作</h3>
                  <Link href={`/payment/${order.id}`}>
                    <Button size="sm">
                      立即支付
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>沟通记录</CardTitle>
            <CardDescription>与工程师的沟通记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无沟通记录
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((msg) => {
                    const isCurrentUser = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-900'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {isCurrentUser ? '我' : '工程师'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(msg.created_at).toLocaleTimeString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="message">发送消息</Label>
                <div className="flex gap-2 mt-2">
                  <Textarea 
                    id="message"
                    placeholder="输入消息..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={messageLoading || !message.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
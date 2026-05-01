'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, MessageSquare, User } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          router.push('/login');
          return;
        }
        setUser(authUser);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError || !profileData) {
          router.push('/');
          return;
        }
        setProfile(profileData);

        // 获取用户参与的订单
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .or(`customer_id.eq.${authUser.id},assigned_engineer_id.eq.${authUser.id}`);

        if (ordersError || !orders) {
          setLoading(false);
          return;
        }

        // 为每个订单获取相关的用户信息和消息
        const conversationPromises = orders.map(async (order: any) => {
          const otherUserId = order.customer_id === authUser.id ? order.assigned_engineer_id : order.customer_id;
          if (!otherUserId) return null;

          const { data: otherUser, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

          if (userError || !otherUser) return null;

          const { data: lastMessage, error: messageError } = await supabase
            .from('order_messages')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            orderId: order.id,
            otherUser,
            lastMessage,
            order
          };
        });

        const results = await Promise.all(conversationPromises);
        const validConversations = results.filter(Boolean);
        setConversations(validConversations);

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  const loadConversation = async (orderId: string) => {
    try {
      const { data: orderMessages, error: messagesError } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(orderMessages || []);
      setSelectedConversation(conversations.find(c => c.orderId === orderId));

      // 设置实时订阅
      const subscription = supabase
        .channel(`chat-${orderId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`
        }, (payload: any) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      // 清理订阅
      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !selectedConversation) return;

    setMessageLoading(true);
    try {
      const { data: newMessage } = await supabase
        .from('order_messages')
        .insert({
          order_id: selectedConversation.orderId,
          sender_id: user.id,
          message: message.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (newMessage) {
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Link href="/profile" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回个人中心
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">消息中心</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 对话列表 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>对话列表</CardTitle>
            <CardDescription>与客户/工程师的对话</CardDescription>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                暂无对话
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.orderId}
                    onClick={() => loadConversation(conversation.orderId)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedConversation?.orderId === conversation.orderId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {conversation.otherUser.display_name || '未设置昵称'}
                        </span>
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-xs text-slate-400">
                          {new Date(conversation.lastMessage.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 line-clamp-1">
                      {conversation.lastMessage?.message || '暂无消息'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      订单: {conversation.order.category_slug}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 聊天窗口 */}
        <Card className="md:col-span-2">
          <CardHeader>
            {selectedConversation ? (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                <CardTitle>{selectedConversation.otherUser.display_name || '未设置昵称'}</CardTitle>
                <CardDescription>
                  订单: {selectedConversation.order.category_slug}
                </CardDescription>
              </div>
            ) : (
              <CardTitle>选择对话</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <div className="flex flex-col h-[600px]">
                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      暂无消息，开始对话吧
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurrentUser = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-900'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {isCurrentUser ? '我' : selectedConversation.otherUser.display_name}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(msg.created_at).toLocaleTimeString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 消息输入框 */}
                <div className="mt-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="输入消息..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 p-3 border rounded-md"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={messageLoading || !message.trim()}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>请从左侧选择一个对话</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
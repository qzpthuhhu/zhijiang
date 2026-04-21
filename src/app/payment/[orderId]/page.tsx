'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
          .eq('id', orderId)
          .single();

        if (!orderData || orderData.customer_id !== authUser.id) {
          router.push('/dashboard/customer');
          return;
        }

        setOrder(orderData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading order:', error);
        setLoading(false);
      }
    };

    if (orderId) {
      loadData();
    }
  }, [supabase, router, orderId]);

  const calculateAmount = () => {
    // 根据订单类型和套餐计算金额
    const priceMap: Record<string, Record<string, number>> = {
      'openclaw': {
        'openclaw-basic': 299,
        'openclaw-pro': 999,
        'openclaw-enterprise': 4999
      },
      'claude-code': {
        'claude-code-quick': 199,
        'claude-code-advanced': 599,
        'claude-code-team': 2999
      },
      'vibe-coding': {
        'vibe-single': 199,
        'vibe-deep': 499,
        'vibe-accompany': 1999
      },
      'rag': {
        'rag-consult': 299,
        'rag-demo': 1999,
        'rag-enterprise': 9999
      },
      'multi-agent': {
        'multi-agent-consult': 399,
        'multi-agent-demo': 2999,
        'multi-agent-enterprise': 19999
      },
      'custom': {
        'custom-service': 500 // 自定义服务默认价格，实际价格由平台审核后确定
      }
    };

    return priceMap[order?.category_slug]?.[order?.package_slug] || 0;
  };

  const handlePayment = async () => {
    if (!order || !user) return;

    setPaymentLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = calculateAmount();

      // 创建支付记录
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          customer_id: user.id,
          amount: amount,
          payment_method: paymentMethod,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 模拟支付过程
      setTimeout(async () => {
        // 更新支付状态为已完成
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            payment_status: 'completed',
            transaction_id: `TXN${Date.now()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        if (updateError) {
          setError('支付失败，请重试');
          setPaymentLoading(false);
          return;
        }

        // 更新平台账户余额
        await supabase
          .rpc('update_platform_balance', { amount: amount });

        // 创建交易记录
        await supabase
          .from('transactions')
          .insert({
            from_user_id: user.id,
            to_user_id: null, // 平台账户
            amount: amount,
            transaction_type: 'payment',
            order_id: order.id,
            payment_id: payment.id,
            status: 'completed'
          });

        // 更新订单状态
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        setSuccess('支付成功！');
        setPaymentLoading(false);

        // 跳转到订单详情页
        setTimeout(() => {
          router.push(`/order/${order.id}`);
        }, 1500);
      }, 2000);
    } catch (err: any) {
      setError(err.message || '支付失败，请重试');
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  if (!order) {
    return <div className="container py-12 text-center">订单不存在</div>;
  }

  const amount = calculateAmount();

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Link href={`/order/${orderId}`} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回订单详情
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>订单支付</CardTitle>
            <CardDescription>请选择支付方式完成付款</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded mb-4">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</div>}

            <div className="space-y-4">
              <div>
                <Label>订单信息</Label>
                <div className="mt-2 p-3 bg-slate-50 rounded-md">
                  <p className="text-sm text-slate-600">服务类型: {order.category_slug}</p>
                  <p className="text-sm text-slate-600">套餐: {order.package_slug}</p>
                  <p className="text-sm text-slate-600">创建时间: {new Date(order.created_at).toLocaleString('zh-CN')}</p>
                </div>
              </div>

              <div>
                <Label>支付金额</Label>
                <div className="mt-2 p-3 bg-slate-50 rounded-md">
                  <p className="text-2xl font-bold text-slate-900">¥{amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label>支付方式</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wechat"
                      checked={paymentMethod === 'wechat'}
                      onChange={() => setPaymentMethod('wechat')}
                      className="mr-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <span className="font-bold">微</span>
                      </div>
                      <span>微信支付</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="alipay"
                      checked={paymentMethod === 'alipay'}
                      onChange={() => setPaymentMethod('alipay')}
                      className="mr-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <span className="font-bold">支</span>
                      </div>
                      <span>支付宝</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-2"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                      <span>银行卡</span>
                    </div>
                  </label>
                </div>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full"
              >
                {paymentLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    支付中...
                  </>
                ) : (
                  '确认支付'
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                支付即表示您同意平台的 <Link href="/terms" className="text-blue-600 hover:underline">服务条款</Link> 和 <Link href="/privacy" className="text-blue-600 hover:underline">隐私政策</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
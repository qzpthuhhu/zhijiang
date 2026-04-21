'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CheckCircle, XCircle, Clock, CreditCard, Users, DollarSign } from 'lucide-react';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [platformAccount, setPlatformAccount] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

        if (profileError || !profileData || profileData.role !== 'admin') {
          router.push('/');
          return;
        }
        setProfile(profileData);

        // 并行加载数据
        const [paymentsResult, transactionsResult, withdrawalsResult, platformAccountResult] = await Promise.all([
          supabase.from('payments').select('*, orders(*, profiles(*))').order('created_at', { ascending: false }),
          supabase.from('transactions').select('*, profiles!from_user_id(*), profiles!to_user_id(*)').order('created_at', { ascending: false }),
          supabase.from('withdrawals').select('*, profiles(*)').order('created_at', { ascending: false }),
          supabase.from('platform_account').select('*').single()
        ]);

        setPayments(paymentsResult.data || []);
        setTransactions(transactionsResult.data || []);
        setWithdrawals(withdrawalsResult.data || []);
        setPlatformAccount(platformAccountResult.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    setActionLoading(true);
    try {
      // 更新提现状态
      const { data: withdrawal, error: updateError } = await supabase
        .from('withdrawals')
        .update({
          withdrawal_status: 'completed',
          transaction_id: `WD${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 更新平台账户余额
      await supabase
        .rpc('update_platform_balance', { amount: -withdrawal.amount });

      // 创建交易记录
      await supabase
        .from('transactions')
        .insert({
          from_user_id: null, // 平台账户
          to_user_id: withdrawal.engineer_id,
          amount: withdrawal.amount,
          transaction_type: 'withdrawal',
          status: 'completed'
        });

      // 重新加载数据
      const { data: withdrawalsResult } = await supabase
        .from('withdrawals')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });
      setWithdrawals(withdrawalsResult || []);

      const { data: platformAccountResult } = await supabase
        .from('platform_account')
        .select('*')
        .single();
      setPlatformAccount(platformAccountResult);

      setActionLoading(false);
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      setActionLoading(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    setActionLoading(true);
    try {
      // 更新提现状态
      await supabase
        .from('withdrawals')
        .update({
          withdrawal_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      // 重新加载数据
      const { data: withdrawalsResult } = await supabase
        .from('withdrawals')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });
      setWithdrawals(withdrawalsResult || []);

      setActionLoading(false);
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  return (
    <div className="container py-12">
      <div className="flex items-center mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回管理后台
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">支付管理</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>平台账户</CardTitle>
          <CardDescription>平台账户余额</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">当前余额</p>
              <p className="text-3xl font-bold text-slate-900">¥{platformAccount?.balance.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-sm text-slate-500">
              最后更新: {platformAccount?.last_updated ? new Date(platformAccount.last_updated).toLocaleString('zh-CN') : 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">支付记录</TabsTrigger>
          <TabsTrigger value="transactions">交易记录</TabsTrigger>
          <TabsTrigger value="withdrawals">提现管理</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>支付记录</CardTitle>
              <CardDescription>查看所有支付记录</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无支付记录
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900">订单 ID: {payment.order_id}</p>
                          <p className="text-sm text-slate-500">客户: {payment.orders?.profiles?.display_name || 'N/A'}</p>
                        </div>
                        <div className={`flex items-center gap-2 ${payment.payment_status === 'completed' ? 'text-green-600' : payment.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {payment.payment_status === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
                           payment.payment_status === 'pending' ? <Clock className="w-4 h-4" /> : 
                           <XCircle className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {payment.payment_status === 'completed' ? '已完成' : 
                             payment.payment_status === 'pending' ? '待处理' : 
                             payment.payment_status === 'failed' ? '失败' : '已退款'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">金额:</span> ¥{payment.amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-slate-500">支付方式:</span> {payment.payment_method}
                        </div>
                        <div>
                          <span className="text-slate-500">创建时间:</span> {new Date(payment.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      {payment.transaction_id && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-500">交易 ID:</span> {payment.transaction_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>交易记录</CardTitle>
              <CardDescription>查看所有交易记录</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无交易记录
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900">交易 ID: {transaction.id}</p>
                          <p className="text-sm text-slate-500">
                            {transaction.from_user_id ? `从: ${transaction['profiles!from_user_id']?.display_name || '平台'}` : '从: 平台'} → 
                            {transaction.to_user_id ? `到: ${transaction['profiles!to_user_id']?.display_name || '平台'}` : '到: 平台'}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 ${transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {transaction.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {transaction.status === 'completed' ? '已完成' : '待处理'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">金额:</span> ¥{transaction.amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-slate-500">类型:</span> 
                          {transaction.transaction_type === 'payment' ? '支付' : 
                           transaction.transaction_type === 'withdrawal' ? '提现' : '退款'}
                        </div>
                        <div>
                          <span className="text-slate-500">创建时间:</span> {new Date(transaction.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      {transaction.order_id && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-500">订单 ID:</span> {transaction.order_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>提现管理</CardTitle>
              <CardDescription>处理工程师的提现请求</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无提现请求
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900">提现 ID: {withdrawal.id}</p>
                          <p className="text-sm text-slate-500">工程师: {withdrawal.profiles?.display_name || 'N/A'}</p>
                        </div>
                        <div className={`flex items-center gap-2 ${withdrawal.withdrawal_status === 'completed' ? 'text-green-600' : withdrawal.withdrawal_status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {withdrawal.withdrawal_status === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
                           withdrawal.withdrawal_status === 'pending' ? <Clock className="w-4 h-4" /> : 
                           <XCircle className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {withdrawal.withdrawal_status === 'completed' ? '已完成' : 
                             withdrawal.withdrawal_status === 'pending' ? '待处理' : '已拒绝'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">金额:</span> ¥{withdrawal.amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-slate-500">提现方式:</span> {withdrawal.withdrawal_method}
                        </div>
                        <div>
                          <span className="text-slate-500">创建时间:</span> {new Date(withdrawal.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      {withdrawal.transaction_id && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-500">交易 ID:</span> {withdrawal.transaction_id}
                        </div>
                      )}
                      {withdrawal.withdrawal_status === 'pending' && (
                        <div className="mt-4 flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            disabled={actionLoading}
                          >
                            批准
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            disabled={actionLoading}
                          >
                            拒绝
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
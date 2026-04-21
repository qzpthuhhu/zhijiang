'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react';

export default function EngineerPendingPage() {
  return (
    <div className="container py-12 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回首页
      </Link>
      
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">申请已提交</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">审核状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">待审核中</span>
            </div>
            <p className="text-slate-600 mt-4 text-sm">
              您的工程师申请已提交，目前正在排队审核中。审核通过后，您将收到通知并可以开始接单。
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="text-slate-600">
            审核预计需要 1-3 个工作日，请耐心等待。
          </p>
          
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="outline" className="w-full">返回首页</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
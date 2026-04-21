'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">需求提交成功</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-slate-600">
              您的技术需求已成功提交，平台将在 <span className="font-semibold text-slate-900">24 小时内</span> 联系您。
            </p>
            <p className="text-slate-500 mt-4 text-sm">
              请保持联系方式畅通，我们的工程师将与您对接具体服务细节。
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard/customer">
            <Button className="w-full">查看我的订单</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" className="w-full">继续浏览服务</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
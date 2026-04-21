import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import { Code2, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '自定义 AI & Coding 服务 - 智匠智装',
  description: '根据您的具体需求，提供定制化的 AI 和编程服务',
};

export default function CustomServicePage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/services" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回服务专区
        </Link>

        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">自定义 AI & Coding 服务</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            根据您的具体需求，提供定制化的 AI 和编程服务，解决您的技术难题
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>服务说明</CardTitle>
            <CardDescription>我们提供以下范围内的自定义服务</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>AI 模型部署与集成</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>机器学习模型训练与优化</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>自然语言处理应用开发</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Web 应用开发与维护</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>移动应用开发</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>后端系统开发</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>数据库设计与优化</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>API 开发与集成</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提交需求</CardTitle>
            <CardDescription>请详细描述您的需求，我们会为您匹配最合适的工程师</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/dashboard/customer" method="GET">
              <input type="hidden" name="service" value="custom" />
              <Button type="submit" className="w-full">
                立即提交需求
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Metadata } from 'next';
import { Check, ArrowLeft, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vibe Coding 大师答疑 - 智匠智装',
  description: 'AI 辅助编程指导，帮你快速构建 Web 应用和小程序',
};

const packages = [
  { slug: 'vibe-single', name: '单次答疑', price: 199, description: '针对具体问题的一次性解答，时长 30 分钟', targetUsers: '个人开发者、创业者', features: ['30 分钟答疑', '具体问题解答', '方案建议', '后续行动指引'] },
  { slug: 'vibe-deep', name: '1小时深度指导', price: 499, description: '深入项目指导，帮你梳理技术方案和实现路径', targetUsers: '有明确项目的开发者', features: ['1 小时深度沟通', '项目分析', '技术方案设计', '代码审查'] },
  { slug: 'vibe-accompany', name: '项目陪跑', price: 1999, description: '全程项目指导，从概念到上线，手把手教你完成', targetUsers: '需要完整项目指导的用户', features: ['全程指导', '需求分析', '架构设计', '代码实现', '上线部署'] },
];

const faqs = [
  { q: 'Vibe Coding 适合什么人？', a: '适合想做网站、小程序、Agent 产品的个人开发者或创业者。' },
  { q: '答疑可以用什么方式？', a: '支持微信语音、视频会议、远程桌面共享等方式。' },
  { q: '项目陪跑周期是多长？', a: '根据项目复杂度，一般 1-4 周完成一个完整项目。' },
];

const examples = [
  '个人博客搭建与部署',
  '小程序开发与上线',
  'AI Agent 产品原型',
  '企业内部管理系统',
  '电商小程序开发',
];

export default function VibeCodingPage() {
  return (
    <div className="container py-12 md:py-16">
      <Link href="/services" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回服务专区
      </Link>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Vibe Coding 大师答疑</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">AI 辅助编程指导，帮你快速构建 Web 应用和小程序</p>
      </div>
      
      <div className="mb-12 p-6 bg-slate-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">适合人群</h2>
        <p className="text-slate-600">想做网站、小程序、Agent 产品的个人开发者或创业者</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {packages.map((pkg) => (
          <Card key={pkg.slug} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              <CardDescription className="text-slate-500 mt-2">{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold text-slate-900 mb-4">¥{pkg.price}</div>
              <p className="text-sm text-slate-600 mb-4">适合：{pkg.targetUsers}</p>
              <ul className="space-y-2">
                {pkg.features.map((f, i) => (<li key={i} className="flex items-center text-sm text-slate-600"><Check className="w-4 h-4 mr-2 text-green-600" />{f}</li>))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={`/order?service=vibe-coding&package=${pkg.slug}`} className="w-full"><Button className="w-full">立即下单</Button></Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">可解决的问题示例</h2>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, i) => (<span key={i} className="px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-700">{ex}</span>))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center"><HelpCircle className="w-6 h-6 mr-2" />常见问题</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-lg">
              <p className="font-medium text-slate-900">{faq.q}</p>
              <p className="text-slate-600 mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
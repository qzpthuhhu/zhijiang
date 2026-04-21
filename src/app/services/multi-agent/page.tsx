import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Metadata } from 'next';
import { Check, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '多 Agent 系统 - 智匠智装',
  description: '多智能体协作系统架构设计与开发',
};

const packages = [
  { slug: 'multi-agent-consult', name: '架构答疑', price: 399, description: '多 Agent 系统架构设计、技术选型咨询', targetUsers: '技术决策者、架构师', features: ['架构设计', '技术选型', '方案评估', '最佳实践'] },
  { slug: 'multi-agent-demo', name: 'Demo 搭建', price: 2999, description: '基于需求搭建多 Agent 协作原型系统', targetUsers: '需要验证概念的企业', features: ['需求分析', 'Agent 设计', '工作流配置', 'Demo 交付'] },
  { slug: 'multi-agent-enterprise', name: '企业多智能体方案', price: 19999, description: '完整企业级多智能体系统，从设计到落地', targetUsers: '需要完整解决方案的企业', features: ['深度咨询', '系统设计', '完整开发', '私有化部署', '培训交付'] },
];

export default function MultiAgentPage() {
  return (
    <div className="container py-12 md:py-16">
      <Link href="/services" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回服务专区
      </Link>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">多 Agent 系统</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">多智能体协作系统架构设计与开发</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Link href={`/order?service=multi-agent&package=${pkg.slug}`} className="w-full"><Button className="w-full">立即下单</Button></Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
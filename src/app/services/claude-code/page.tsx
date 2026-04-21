import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Metadata } from 'next';
import { Check, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Claude Code 配置 - 智匠智装',
  description: 'Claude Code 集成配置，环境搭建，定制化开发服务',
};

const packages = [
  { slug: 'claude-code-quick', name: '快速接入', price: 199, description: '30 分钟内完成环境配置，快速开始 AI 编程之旅', targetUsers: '个人开发者、初学者', features: ['环境安装', '基础配置', '入门指导', '常见问题解答'] },
  { slug: 'claude-code-advanced', name: '高级配置', price: 599, description: '深度定制、自动化工作流、多工具链集成', targetUsers: '专业开发者、技术团队', features: ['深度定制', '工作流配置', '工具链集成', '团队协作优化'] },
  { slug: 'claude-code-team', name: '团队方案', price: 2999, description: '企业级团队部署、权限管理、统一配置、培训支持', targetUsers: '企业技术团队、研发部门', features: ['团队部署', '权限管理', '统一配置', '团队培训', '技术支持'] },
];

export default function ClaudeCodePage() {
  return (
    <div className="container py-12 md:py-16">
      <Link href="/services" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回服务专区
      </Link>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Claude Code 配置</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Claude Code 集成配置，环境搭建，定制化开发服务</p>
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
              <Link href={`/order?service=claude-code&package=${pkg.slug}`} className="w-full"><Button className="w-full">立即下单</Button></Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
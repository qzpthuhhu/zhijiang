'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  Code2, 
  MessageSquare, 
  Database, 
  Network, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

const services = [
  {
    slug: 'openclaw',
    name: 'OpenClaw 安装部署',
    description: '专业团队为您提供 OpenClaw 本地化部署服务，支持 Windows、Linux、Mac 全平台',
    icon: Bot,
  },
  {
    slug: 'claude-code',
    name: 'Claude Code 配置',
    description: 'Claude Code 集成配置，环境搭建，定制化开发服务',
    icon: Code2,
  },
  {
    slug: 'vibe-coding',
    name: 'Vibe Coding 大师答疑',
    description: 'AI 辅助编程指导，帮你快速构建 Web 应用和小程序',
    icon: MessageSquare,
  },
  {
    slug: 'rag',
    name: 'RAG 方案与部署',
    description: '企业级知识库搭建，RAG 技术方案咨询与实施',
    icon: Database,
  },
  {
    slug: 'multi-agent',
    name: '多 Agent 系统',
    description: '多智能体协作系统架构设计与开发',
    icon: Network,
  },
];

const advantages = [
  { icon: CheckCircle2, text: '真实认证工程师' },
  { icon: CheckCircle2, text: '中文远程支持' },
  { icon: CheckCircle2, text: '标准化交付流程' },
  { icon: CheckCircle2, text: '企业客户可开票' },
];

const process = [
  { step: '1', title: '提交需求', description: '描述您的技术需求' },
  { step: '2', title: '平台匹配', description: '智能匹配合适工程师' },
  { step: '3', title: '远程交付', description: '在线完成服务交付' },
  { step: '4', title: '验收完成', description: '确认服务满意后完成' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              把复杂 AI 技术，交给靠谱工程师
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              OpenClaw、Claude Code、RAG、多 Agent、Vibe Coding 答疑，一站式远程技术服务平台
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="w-full sm:w-auto">
                  我想寻找技术帮助
                </Button>
              </Link>
              <Link href="/become-engineer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  我想成为远程工程师
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">服务专区</h2>
            <p className="mt-4 text-slate-600">
              多种 AI 技术服务，满足不同层次的技术需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-slate-300 cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="text-slate-500">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      查看详情 <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">平台优势</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {advantages.map((adv, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <adv.icon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-medium text-slate-700">{adv.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">服务流程</h2>
            <p className="mt-4 text-slate-600">
              简单四步，快速获得技术支持
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {process.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              加入智匠智装，成为平台远程工程师
            </h2>
            <p className="text-slate-300 mb-8">
              利用你的技术能力获得持续收入，与优秀同行一起成长
            </p>
            <Link href="/become-engineer">
              <Button size="lg" variant="secondary">
                申请加入
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
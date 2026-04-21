import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import { Bot, Code2, MessageSquare, Database, Network, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '服务专区 - 智匠智装',
  description: '浏览智匠智装提供的全部 AI 技术服务：OpenClaw 安装部署、Claude Code 配置、Vibe Coding 答疑、RAG 方案、多 Agent 系统、自定义 AI & Coding 服务',
};

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
  {
    slug: 'custom',
    name: '自定义 AI & Coding 服务',
    description: '根据您的具体需求，提供定制化的 AI 和编程服务',
    icon: Code2,
  },
];

export default function ServicesPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">服务专区</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          多种 AI 技术服务，满足从个人开发者到企业的不同层次需求
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
                  查看套餐 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, DollarSign, Shield, Users } from 'lucide-react';

const benefits = [
  { icon: DollarSign, title: '持续收入', description: '平台订单稳定，报酬透明，按项目结算' },
  { icon: Shield, title: '审核认证', description: '平台背书，审核制入驻，提升客户信任度' },
  { icon: Users, title: '精准匹配', description: '智能推荐订单，精准匹配你的技术方向' },
];

const requirements = [
  '具备 2 年以上相关技术经验',
  '熟悉至少一项平台服务技术栈',
  '具备良好的沟通能力和服务意识',
  '能配合客户时间进行远程服务',
];

const serviceTypes = [
  'OpenClaw 安装部署',
  'Claude Code 配置',
  'Vibe Coding 答疑',
  'RAG 方案部署',
  '多 Agent 系统开发',
];

export default function BecomeEngineerPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">成为智匠智装远程工程师</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            利用你的技术能力获得持续收入，与优秀同行一起成长
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>可接单的服务类型</CardTitle>
            <CardDescription>平台支持多种 AI 技术服务方向</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {serviceTypes.map((type, idx) => (
                <span key={idx} className="px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-700">
                  {type}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>申请要求</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/register?role=engineer">
            <Button size="lg">申请加入</Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            申请后需要 1-3 个工作日审核，审核通过后即可开始接单
          </p>
        </div>
      </div>
    </div>
  );
}
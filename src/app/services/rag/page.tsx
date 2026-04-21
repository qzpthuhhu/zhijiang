import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Metadata } from 'next';
import { Check, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RAG 方案与部署 - 智匠智装',
  description: '企业级知识库搭建，RAG 技术方案咨询与实施',
};

const packages = [
  { slug: 'rag-consult', name: 'RAG 咨询答疑', price: 299, description: 'RAG 技术选型、方案设计、问题诊断', targetUsers: '想了解 RAG 技术的团队', features: ['技术咨询', '方案评估', '问题诊断', '建议报告'] },
  { slug: 'rag-demo', name: 'RAG Demo 搭建', price: 1999, description: '基于您的数据源，快速搭建可演示的 RAG 原型', targetUsers: '需要概念验证的企业', features: ['数据接入', '向量检索', '问答界面', 'Demo 交付', '技术文档'] },
  { slug: 'rag-enterprise', name: '企业知识库方案', price: 9999, description: '完整企业级知识库系统，包含私有化部署和培训', targetUsers: '需要私有化部署的企业', features: ['架构设计', '私有化部署', '数据迁移', '运维培训', '长期支持'] },
];

export default function RAGPage() {
  return (
    <div className="container py-12 md:py-16">
      <Link href="/services" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回服务专区
      </Link>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">RAG 方案与部署</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">企业级知识库搭建，RAG 技术方案咨询与实施</p>
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
              <Link href={`/order?service=rag&package=${pkg.slug}`} className="w-full"><Button className="w-full">立即下单</Button></Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
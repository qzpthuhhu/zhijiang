import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import { Bot, Check, ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OpenClaw 安装部署 - 智匠智装',
  description: '专业团队为您提供 OpenClaw 本地化部署服务，支持 Windows、Linux、Mac 全平台',
};

const packages = [
  {
    slug: 'basic',
    name: '基础版',
    price: 999,
    description: '适合个人开发者和小型团队',
    features: [
      'OpenClaw 基础安装部署',
      'Windows/Linux 平台支持',
      '基础配置优化',
      '7天技术支持',
      '安装文档',
    ],
    recommended: false,
  },
  {
    slug: 'pro',
    name: '专业版',
    price: 1999,
    description: '适合企业级应用和专业开发团队',
    features: [
      'OpenClaw 完整安装部署',
      '全平台支持（Windows/Linux/Mac）',
      '高级配置优化',
      '30天技术支持',
      '详细安装文档',
      '性能调优',
      '定期更新提醒',
    ],
    recommended: true,
  },
  {
    slug: 'enterprise',
    name: '企业版',
    price: 3999,
    description: '适合大型企业和生产环境',
    features: [
      'OpenClaw 企业级部署',
      '全平台支持',
      '定制化配置',
      '90天技术支持',
      '专属技术顾问',
      '性能优化',
      '安全加固',
      '定期维护',
      '培训服务',
    ],
    recommended: false,
  },
];

export default function OpenClawPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {/* 服务头部 */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">OpenClaw 安装部署</h1>
          <p className="text-lg text-slate-600 mb-6">
            专业团队为您提供 OpenClaw 本地化部署服务，支持 Windows、Linux、Mac 全平台
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/order?service=openclaw">
                立即咨询
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/engineers">
                查看工程师
              </Link>
            </Button>
          </div>
        </div>

        {/* 服务介绍 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>服务介绍</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              OpenClaw 是一款功能强大的 AI 辅助开发工具，我们的专业团队可以为您提供完整的安装部署服务，确保系统稳定运行。
            </p>
            <p className="text-slate-600 mb-4">
              我们的服务包括：
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>全平台支持（Windows、Linux、Mac）</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>专业的配置优化</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>详细的安装文档</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>专业的技术支持</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 套餐选择 */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">选择套餐</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.slug} 
              className={`relative ${pkg.recommended ? 'border-2 border-blue-600' : 'border'}`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl">
                  推荐
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">¥{pkg.price}</span>
                  <span className="text-slate-500 ml-2">/次</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" asChild>
                  <Link href={`/order?service=openclaw&package=${pkg.slug}`}>
                    选择套餐
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 常见问题 */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">安装需要多长时间？</h4>
                <p className="text-slate-600 text-sm">
                  基础版安装通常需要 1-2 小时，专业版和企业版可能需要 2-4 小时，具体时间取决于您的系统环境。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">支持哪些操作系统？</h4>
                <p className="text-slate-600 text-sm">
                  我们支持 Windows 10/11、主流 Linux 发行版（Ubuntu、CentOS、Debian 等）和 macOS。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">技术支持包含哪些内容？</h4>
                <p className="text-slate-600 text-sm">
                  技术支持包括安装过程中的问题解决、基本配置指导和系统故障排查。企业版还提供专属技术顾问服务。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部导航 */}
        <div className="flex justify-between items-center mt-12">
          <Button variant="outline" asChild>
            <Link href="/services">
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              返回服务列表
            </Link>
          </Button>
          <Button asChild>
            <Link href="/services/claude-code">
              下一个服务
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
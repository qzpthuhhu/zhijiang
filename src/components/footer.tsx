import Link from 'next/link';

const footerLinks = {
  services: [
    { name: 'OpenClaw 安装部署', href: '/services/openclaw' },
    { name: 'Claude Code 配置', href: '/services/claude-code' },
    { name: 'Vibe Coding 大师答疑', href: '/services/vibe-coding' },
    { name: 'RAG 方案与部署', href: '/services/rag' },
    { name: '多 Agent 系统', href: '/services/multi-agent' },
  ],
  company: [
    { name: '关于我们', href: '/about' },
    { name: '成为工程师', href: '/become-engineer' },
    { name: '联系我们', href: '/contact' },
  ],
  legal: [
    { name: '服务条款', href: '/terms' },
    { name: '隐私政策', href: '/privacy' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-slate-900">
              智匠智装
            </Link>
            <p className="mt-4 text-sm text-slate-600">
              专业的 AI 技术服务平台，连接技术专家与需求用户
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">服务专区</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">关于我们</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">法律</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} 智匠智装. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
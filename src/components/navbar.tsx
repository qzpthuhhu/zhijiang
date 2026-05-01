'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: '服务专区', href: '/services' },
  { name: '成为工程师', href: '/become-engineer' },
  { name: '工程师列表', href: '/engineers' },
];

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };

    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-900">智匠智装</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-slate-900',
                  pathname === item.href
                    ? 'text-slate-900'
                    : 'text-slate-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* 桌面端按钮 */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href={profile?.role === 'customer' ? '/dashboard/customer' : '/dashboard/engineer'}>
                  <Button variant="ghost" size="sm">工作台</Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="sm">消息中心</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">个人中心</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>退出</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">注册</Button>
                </Link>
              </>
            )}
            {!user || profile?.role === 'customer' && (
              <Link href="/order">
                <Button size="sm" variant="secondary">立即咨询</Button>
              </Link>
            )}
          </div>
          
          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="container py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block py-2 text-sm font-medium transition-colors hover:text-slate-900',
                  pathname === item.href
                    ? 'text-slate-900'
                    : 'text-slate-600'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link href={profile?.role === 'customer' ? '/dashboard/customer' : '/dashboard/engineer'} className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    工作台
                  </Link>
                  <Link href="/chat" className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    消息中心
                  </Link>
                  <Link href="/profile" className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    个人中心
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    登录
                  </Link>
                  <Link href="/register" className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    注册
                  </Link>
                </>
              )}
              {!user || profile?.role === 'customer' && (
                <Link href="/order" className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                  立即咨询
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
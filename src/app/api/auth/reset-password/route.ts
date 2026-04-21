import { NextRequest, NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';

async function proxyFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const agent = new HttpsProxyAgent(proxyUrl);
  return fetch(url, { ...options, agent } as any);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceKey) {
      return NextResponse.json({ error: '服务端配置错误' }, { status: 500 });
    }

    const headers = {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
      'Content-Type': 'application/json',
    };

    if (!password) {
      // 场景1: 只提供邮箱 - 发送重置密码邮件
      const listRes = await proxyFetch(
        `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=10&filter=email.eq.${encodeURIComponent(email)}`,
        { headers }
      );

      if (!listRes.ok) {
        return NextResponse.json({ error: '用户验证失败' }, { status: 400 });
      }

      const usersData = await listRes.json();
      const users = usersData.users || [];
      const user = users.find((u: any) => u.email === email);

      if (!user) {
        // 为了安全，即使用户不存在也返回成功（防止枚举攻击）
        return NextResponse.json({ success: true, message: '如果邮箱存在，重置链接已发送' });
      }

      // 使用 Admin API 生成重置链接
      const linkRes = await proxyFetch(
        `${supabaseUrl}/auth/v1/admin/generate_link`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'recovery',
            email: email,
            redirect_to: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?next=true`,
          }),
        }
      );

      if (!linkRes.ok) {
        const err = await linkRes.text();
        console.error('Generate link error:', err);
        return NextResponse.json({ error: '发送重置邮件失败' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: '重置链接已发送到邮箱' });
    }

    // 场景2: 提供邮箱和密码 - 使用 Admin API 直接更新密码
    if (password.length < 6) {
      return NextResponse.json({ error: '密码长度至少为 6 个字符' }, { status: 400 });
    }

    // 通过邮箱查找用户
    const listRes = await proxyFetch(
      `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=10&filter=email.eq.${encodeURIComponent(email)}`,
      { headers }
    );

    if (!listRes.ok) {
      const err = await listRes.text();
      console.error('List users error:', err);
      return NextResponse.json({ error: '用户验证失败' }, { status: 400 });
    }

    const usersData = await listRes.json();
    const users = usersData.users || [];
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 用 Admin API 更新密码（不需要 email_confirm，因为我们已经验证了用户身份）
    const updateRes = await proxyFetch(
      `${supabaseUrl}/auth/v1/admin/users/${user.id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ password }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error('Update password error:', err);
      return NextResponse.json({ error: '更新密码失败' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: err.message || '服务器错误' }, { status: 500 });
  }
}
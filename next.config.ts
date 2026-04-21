import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出配置（可选，用于部署到静态托管）
  // output: 'export',
  // distDir: 'dist',

  // 图片优化配置
  images: {
    unoptimized: true, // 如果使用静态导出，需要设置为 true
  },

  // 环境变量（生产环境会覆盖）
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // 临时禁用 React Strict Mode 以避免 Supabase Gotrue-js 的 auth token 锁竞争问题
  // 问题原因：Strict Mode 双倍调用 useEffect，导致并发的 getUser() 调用互相抢占锁
  reactStrictMode: false,
};

export default nextConfig;

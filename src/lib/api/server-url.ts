/**
 * 获取服务器基础URL
 * 用于内部API调用，避免依赖用户请求的URL
 */
export function getServerBaseUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // 开发环境默认使用本地地址
  const port = process.env.PORT || '3939';
  return `http://localhost:${port}`;
} 
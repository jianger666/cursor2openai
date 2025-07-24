import { NextRequest } from 'next/server';

/**
 * 获取服务器基础URL
 * 用于内部API调用，避免依赖用户请求的URL
 */
export function getServerBaseUrl(): string {
  // 优先使用自定义的环境变量
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Vercel 部署环境
  if (process.env.VERCEL_URL) {
    // VERCEL_URL 不包含协议前缀，需要手动添加
    return `https://${process.env.VERCEL_URL}`;
  }

  // 尝试使用 Vercel 项目生产域名
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 尝试使用 Vercel 分支 URL
  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }

  // 开发环境默认使用本地地址
  const port = process.env.PORT || '3939';
  return `http://localhost:${port}`;
}

/**
 * 从请求对象中获取当前的 base URL
 * 这个方法可以作为 getServerBaseUrl 的备用方案
 * @param request NextRequest 对象
 * @returns 当前请求的 base URL
 */
export function getBaseUrlFromRequest(request: NextRequest): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * 获取最准确的服务器 base URL
 * 优先使用环境变量，如果没有则从请求中获取
 * @param request 可选的 NextRequest 对象
 * @returns 服务器的 base URL
 */
export function getBestServerBaseUrl(request?: NextRequest): string {
  // 首先尝试从环境变量获取
  const envBaseUrl = getServerBaseUrl();
  
  // 如果不是本地开发环境，直接返回环境变量的值
  if (!envBaseUrl.includes('localhost')) {
    return envBaseUrl;
  }
  
  // 如果是本地开发环境且有请求对象，尝试从请求中获取
  if (request) {
    return getBaseUrlFromRequest(request);
  }
  
  // 否则返回环境变量的值
  return envBaseUrl;
} 
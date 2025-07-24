import { NextRequest, NextResponse } from 'next/server';
import { getServerBaseUrl, getBaseUrlFromRequest, getBestServerBaseUrl } from '@/lib/api/server-url';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    PORT: process.env.PORT,
  };

  const urls = {
    getServerBaseUrl: getServerBaseUrl(),
    getBaseUrlFromRequest: getBaseUrlFromRequest(request),
    getBestServerBaseUrl: getBestServerBaseUrl(request),
  };

  return NextResponse.json({
    message: 'URL 获取测试',
    environmentVariables: envVars,
    computedUrls: urls,
    requestUrl: request.url,
  });
} 
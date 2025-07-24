import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/api/handler';

export const runtime = 'edge';

export const POST = apiHandler(async (request: NextRequest) => {
  
  const url = new URL(request.url);
  console.log('url',url.protocol,'//',url.host);
  const internalUrl = `${url.protocol}//${url.host}/api/cursor2openai/internal/loginDeepControl`;

  // 转发所有headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // 获取请求体
  const body = await request.text();

  const response = await fetch(internalUrl, {
    method: 'POST',
    headers,
    body,
  });

  return response;
});

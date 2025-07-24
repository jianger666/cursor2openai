import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/api/handler';
import { getBestServerBaseUrl } from '@/lib/api/server-url';

export const runtime = 'edge';

export const GET = apiHandler(async (request: NextRequest) => {
  const baseUrl = getBestServerBaseUrl(request);
  const internalUrl = `${baseUrl}/api/cursor2openai/internal/chat/completions`;

  // 转发所有headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const response = await fetch(internalUrl, {
    method: 'GET',
    headers,
  });

  return response;
});

export const POST = apiHandler(async (request: NextRequest) => {
  const baseUrl = getBestServerBaseUrl(request);
  const internalUrl = `${baseUrl}/api/cursor2openai/internal/chat/completions`;

  // 转发所有headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body = await request.text();

  const response = await fetch(internalUrl, {
    method: 'POST',
    headers,
    body,
  });

  return response;
});

import { NextResponse } from 'next/server';
import { HttpStatus, getStatusMessage } from './httpStatus';

/**
 * 标准API响应接口
 */
export interface ApiResponse<T = unknown> {
  data: T | null; // 业务数据
  message: string; // 状态描述
  success: boolean; // 请求是否成功
  timestamp?: number; // 时间戳(可选)
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @param statusCode HTTP状态码
 */
export function createSuccessResponse<T>({
  data,
  message,
  statusCode = HttpStatus.OK,
}: {
  data: T;
  message?: string;
  statusCode?: HttpStatus;
}): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      message: message || getStatusMessage(statusCode),
      success: true,
      timestamp: Date.now(),
    },
    { status: statusCode }
  );
}

/**
 * 创建错误响应
 * @param message 错误消息
 * @param statusCode HTTP状态码
 */
export function createErrorResponse({
  message,
  statusCode = HttpStatus.UNPROCESSABLE_ENTITY,
}: {
  message?: string;
  statusCode?: HttpStatus;
}): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      data: null,
      message: message || getStatusMessage(statusCode),
      success: false,
      timestamp: Date.now(),
    },
    { status: statusCode }
  );
}

/**
 * 用于流式响应的创建函数
 * @param stream 数据流
 */
export function createStreamResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

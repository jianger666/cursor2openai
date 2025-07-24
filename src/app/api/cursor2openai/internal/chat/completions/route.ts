import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api/handler';
import { v4 as uuidv4 } from 'uuid';
import { fetch, ProxyAgent, Agent } from 'undici';
import config from '../../../_config/config.js';
import $root from '../../../_proto/message.js';
import {
  generateCursorBody,
  chunkToUtf8String,
  generateHashed64Hex,
  generateCursorChecksum,
} from '../../../_utils/utils.js';

export const GET = apiHandler(async (request: NextRequest) => {
  try {
    const bearerToken = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');
    let authToken = bearerToken?.split(',').map((key) => key.trim())[0];
    if (authToken && authToken.includes('%3A%3A')) {
      authToken = authToken.split('%3A%3A')[1];
    } else if (authToken && authToken.includes('::')) {
      authToken = authToken.split('::')[1];
    }

    const cursorChecksum =
      request.headers.get('x-cursor-checksum') ??
      generateCursorChecksum(authToken?.trim() || '');
    const cursorClientVersion = '0.48.7';

    const availableModelsResponse = await fetch(
      'https://api2.cursor.sh/aiserver.v1.AiService/AvailableModels',
      {
        method: 'POST',
        headers: {
          'accept-encoding': 'gzip',
          authorization: `Bearer ${authToken}`,
          'connect-protocol-version': '1',
          'content-type': 'application/proto',
          'user-agent': 'connect-es/1.6.1',
          'x-cursor-checksum': cursorChecksum,
          'x-cursor-client-version': cursorClientVersion,
          'x-cursor-config-version': uuidv4(),
          'x-cursor-timezone': 'Asia/Shanghai',
          'x-ghost-mode': 'true',
          Host: 'api2.cursor.sh',
        },
      }
    );
    const data = await availableModelsResponse.arrayBuffer();
    const buffer = Buffer.from(data);
    try {
      const models = ($root as any).AvailableModelsResponse.decode(buffer).models;

      return NextResponse.json({
        object: 'list',
        data: models.map((model: any) => ({
          id: model.name,
          created: Date.now(),
          object: 'model',
          owned_by: 'cursor',
        })),
      });
    } catch {
      const text = buffer.toString('utf-8');
      throw new Error(text);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
});

export const POST = apiHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { model, messages, stream = false } = body;
    const bearerToken = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');
    const keys = bearerToken?.split(',').map((key) => key.trim()) || [];
    let authToken = keys[Math.floor(Math.random() * keys.length)];

    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      !authToken
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid request. Messages should be a non-empty array and authorization is required',
        },
        { status: 400 }
      );
    }

    if (authToken && authToken.includes('%3A%3A')) {
      authToken = authToken.split('%3A%3A')[1];
    } else if (authToken && authToken.includes('::')) {
      authToken = authToken.split('::')[1];
    }

    const cursorChecksum =
      request.headers.get('x-cursor-checksum') ??
      generateCursorChecksum(authToken.trim());

    // 使用简单的hash生成sessionid
    const sessionid = generateHashed64Hex(authToken).substring(0, 32);
    const clientKey = generateHashed64Hex(authToken);
    const cursorClientVersion = '0.48.7';
    const cursorConfigVersion = uuidv4();

    const cursorBody = generateCursorBody(messages, model);
    const dispatcher = config.proxy.enabled
      ? new ProxyAgent(config.proxy.url)
      : new Agent({ allowH2: true });

    // 为 undici fetch 创建选项对象
    const fetchOptions: any = {
      method: 'POST',
      headers: {
        authorization: `Bearer ${authToken}`,
        'connect-accept-encoding': 'gzip',
        'connect-content-encoding': 'gzip',
        'connect-protocol-version': '1',
        'content-type': 'application/connect+proto',
        'user-agent': 'connect-es/1.6.1',
        'x-amzn-trace-id': `Root=${uuidv4()}`,
        'x-client-key': clientKey,
        'x-cursor-checksum': cursorChecksum,
        'x-cursor-client-version': cursorClientVersion,
        'x-cursor-config-version': cursorConfigVersion,
        'x-cursor-timezone': 'Asia/Shanghai',
        'x-ghost-mode': 'true',
        'x-request-id': uuidv4(),
        'x-session-id': sessionid,
        Host: 'api2.cursor.sh',
      },
      body: cursorBody,
      dispatcher: dispatcher,
      timeout: {
        connect: 5000,
        read: 30000,
      },
    };

    const response = await fetch(
      'https://api2.cursor.sh/aiserver.v1.ChatService/StreamUnifiedChatWithTools',
      fetchOptions
    );

    if (response.status !== 200) {
      return NextResponse.json(
        {
          error: response.statusText,
        },
        { status: response.status }
      );
    }

    if (stream) {
      const encoder = new TextEncoder();
      const responseId = `chatcmpl-${uuidv4()}`;

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            let thinkingStart = '<thinking>';
            let thinkingEnd = '</thinking>';
            for await (const chunk of response.body as any) {
              const { thinking, text } = chunkToUtf8String(chunk);
              let content = '';

              if (thinkingStart !== '' && thinking.length > 0) {
                content += thinkingStart + '\n';
                thinkingStart = '';
              }
              content += thinking;
              if (
                thinkingEnd !== '' &&
                thinking.length === 0 &&
                text.length !== 0 &&
                thinkingStart === ''
              ) {
                content += '\n' + thinkingEnd + '\n';
                thinkingEnd = '';
              }

              content += text;

              if (content.length > 0) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      id: responseId,
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model: model,
                      choices: [
                        {
                          index: 0,
                          delta: {
                            content: content,
                          },
                        },
                      ],
                    })}\n\n`
                  )
                );
              }
            }
          } catch (streamError: any) {
            console.error('Stream error:', streamError);
            if (streamError.name === 'TimeoutError') {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: 'Server response timeout' })}\n\n`
                )
              );
            } else {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`
                )
              );
            }
          } finally {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      try {
        let thinkingStart = '<thinking>';
        let thinkingEnd = '</thinking>';
        let content = '';
        for await (const chunk of response.body as any) {
          const { thinking, text } = chunkToUtf8String(chunk);

          if (thinkingStart !== '' && thinking.length > 0) {
            content += thinkingStart + '\n';
            thinkingStart = '';
          }
          content += thinking;
          if (
            thinkingEnd !== '' &&
            thinking.length === 0 &&
            text.length !== 0 &&
            thinkingStart === ''
          ) {
            content += '\n' + thinkingEnd + '\n';
            thinkingEnd = '';
          }

          content += text;
        }

        return NextResponse.json({
          id: `chatcmpl-${uuidv4()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: content,
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        });
      } catch (error: any) {
        console.error('Non-stream error:', error);
        if (error.name === 'TimeoutError') {
          return NextResponse.json(
            { error: 'Server response timeout' },
            { status: 408 }
          );
        }
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = {
      error:
        error.name === 'TimeoutError'
          ? 'Request timeout'
          : 'Internal server error',
    };

    return NextResponse.json(errorMessage, {
      status: error.name === 'TimeoutError' ? 408 : 500,
    });
  }
});

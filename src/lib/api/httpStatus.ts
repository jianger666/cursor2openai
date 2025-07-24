/**
 * HTTP状态码枚举
 * 常用HTTP状态码的枚举定义，便于API路由统一使用
 */
export enum HttpStatus {
  // 0xx - 未知错误
  UNKNOWN = 0,

  // 2xx - 成功响应
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 3xx - 重定向
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,

  // 4xx - 客户端错误
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  CONFLICT = 409,
  GONE = 410,
  UNSUPPORTED_MEDIA_TYPE = 415,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  CLIENT_CLOSED_REQUEST = 499,

  // 5xx - 服务端错误
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * 获取HTTP状态码对应的默认消息
 * @param statusCode HTTP状态码
 * @returns 对应的默认消息
 */
export function getStatusMessage(statusCode: HttpStatus): string {
  switch (statusCode) {
    // 0
    case HttpStatus.UNKNOWN:
      return '未知错误';

    // 2xx
    case HttpStatus.OK:
      return '请求成功';
    case HttpStatus.CREATED:
      return '资源创建成功';
    case HttpStatus.ACCEPTED:
      return '请求已接受，正在处理';
    case HttpStatus.NO_CONTENT:
      return '请求成功，无返回内容';

    // 4xx
    case HttpStatus.BAD_REQUEST:
      return '无效的请求';
    case HttpStatus.UNAUTHORIZED:
      return '未授权访问';
    case HttpStatus.FORBIDDEN:
      return '禁止访问';
    case HttpStatus.NOT_FOUND:
      return '资源不存在';
    case HttpStatus.METHOD_NOT_ALLOWED:
      return '请求方法不允许';
    case HttpStatus.CONFLICT:
      return '资源冲突';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return '请求参数有误';
    case HttpStatus.TOO_MANY_REQUESTS:
      return '请求过于频繁';
    case HttpStatus.CLIENT_CLOSED_REQUEST:
      return '请求被取消';

    // 5xx
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return '服务器内部错误';
    case HttpStatus.NOT_IMPLEMENTED:
      return '功能未实现';
    case HttpStatus.BAD_GATEWAY:
      return '网关错误';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return '服务不可用';
    case HttpStatus.GATEWAY_TIMEOUT:
      return '网关超时';

    default:
      return '未知状态';
  }
}

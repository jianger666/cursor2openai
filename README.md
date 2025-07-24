# Cursor to OpenAI API

将 Cursor AI 服务转换为标准 OpenAI API 格式的代理服务，支持一键部署到 Vercel。

## 🚀 特性

- ✅ 将 Cursor AI 转换为标准 OpenAI API 格式
- ✅ 支持一键部署到 Vercel（免费使用 Edge Functions）
- ✅ 完全兼容 OpenAI API 格式
- ✅ 支持流式响应和非流式响应
- ✅ 无需额外服务器成本，白嫖 Vercel 的 Serverless 服务
- ✅ 无需复杂环境变量配置，开箱即用

## 📋 前提条件

只需要一个 **Cursor 账号**即可：

- 新用户有 150 次免费的高级请求
- **推荐充值 Cursor Pro 账号**：可以使用 Cursor 上所有的模型（Claude、GPT-4、o1 等）
- 通过本项目将 Cursor 所有模型转换为标准 OpenAI API，在大量 API 调用场景下非常实用
- 如需重置免费额度，可以删除账号后重新注册

## 🔧 部署方式

### 方式一：一键部署到 Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jianger666/cursor2openai)

1. 点击上方按钮一键部署到 Vercel
2. 等待部署完成，获取你的域名：`https://your-domain.vercel.app`
3. **无需任何环境变量配置，开箱即用！**

### 方式二：本地部署

```bash
# 克隆项目
git clone https://github.com/jianger666/cursor2openai.git
cd cursor2openai

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 启动开发服务器
npm run dev
# 或使用 pnpm
pnpm dev
```

**本地开发也无需配置环境变量，默认运行在 `http://localhost:3000`**

## 🔑 获取 API Token

### 第一步：获取 Cursor Session Token

1. 打开 [cursor.com](https://cursor.com) 并登录你的账号
2. 按 `F12` 打开浏览器开发者工具
3. 切换到 `Application`（应用程序）或 `Storage`（存储）标签页
4. 在左侧找到 `Cookies` 并点击展开
5. 选择 `https://cursor.com` 域名
6. 在右侧找到名为 `WorkosCursorSessionToken` 的 Cookie
7. 复制该 Cookie 的 `Value` 值

### 第二步：转换为 OpenAI API Token

使用获取到的 Session Token 调用接口：

```bash
curl -X POST https://your-domain.vercel.app/api/cursor2openai/loginDeepControl \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_WORKOS_CURSOR_SESSION_TOKEN"}'
```

响应示例：
```json
{
    "code": 0,
    "msg": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxx",
        "expires_at": 1111111,
        "expires_at_human": "2025-09-22 00:00:00"
    }
}
```

响应中的 `data.token` 字段就是你的 **OpenAI API Key**。

## 📝 使用方法

### API 基础信息

- **Base URL**: `https://your-domain.vercel.app/api/cursor2openai/v1`
- **API Key**: 通过上述步骤获取的 token
- **完全兼容 OpenAI API 格式**

### 支持的模型

- 所有 Cursor上的 支持的模型

### cURL 示例

```bash
curl -X POST https://your-domain.vercel.app/api/cursor2openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CURSOR_TOKEN" \
  -d '{
    "model": "default",
    "messages": [
      {
        "role": "user",
        "content": "你好，世界！"
      }
    ],
    "stream": false
  }'
```

### Python 示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_CURSOR_TOKEN",
    base_url="https://your-domain.vercel.app/api/cursor2openai/v1"
)

response = client.chat.completions.create(
    model="default",
    messages=[
        {"role": "user", "content": "你好，世界！"}
    ],
    stream=False
)

print(response.choices[0].message.content)
```

### JavaScript/Node.js 示例

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_CURSOR_TOKEN',
  baseURL: 'https://your-domain.vercel.app/api/cursor2openai/v1'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: '你好，世界！' }],
    model: 'default',
    stream: false
  });

  console.log(completion.choices[0].message.content);
}

main();
```

## 📁 项目结构

```
src/app/api/cursor2openai/
├── loginDeepControl/          # 登录接口
├── internal/                  # 内部接口
├── v1/                       # OpenAI 兼容接口
├── _config/                  # 配置文件
├── _proto/                   # Protocol Buffers
├── _utils/                   # 工具函数
└── _tool/                    # 工具脚本
```

## ⚠️ 注意事项

- 请妥善保管你的 Cursor Token，不要泄露给他人
- 本项目仅供学习和研究使用，请遵守 Cursor 的使用条款
- Token 有一定的有效期，过期后需要重新获取
- 建议在生产环境中添加适当的访问控制和限流措施

## 🙏 致谢

- 感谢 [JiuZ-Chn/Cursor-To-OpenAI](https://github.com/JiuZ-Chn/Cursor-To-OpenAI) 项目，本项目的 `/v1/chat/completions` 接口参考了该项目的实现
- 感谢 [cursor.meteormail.me](https://cursor.meteormail.me/) 网站，本项目使用了其 `loginDeepControl` 接口服务

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！ 
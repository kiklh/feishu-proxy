# 飞书 Webhook 签名代理 (Feishu Webhook Proxy)

一个轻量级的 Vercel Serverless 函数，用于接收任意 HTTP POST 请求，自动计算飞书自定义机器人的签名，并将消息转发到飞书群聊。

## ✨ 功能特性

- **自动签名**：根据飞书机器人安全设置中的签名密钥，自动生成 `timestamp` 和 `sign`，无需手动计算。
- **通用输入**：支持纯文本或 JSON 格式的请求体，自动提取 `text`、`message`、`content` 等字段作为消息内容。
- **零服务器**：基于 Vercel Serverless 函数，免费额度充足，无需维护服务器。
- **易于集成**：可与 1Panel、Komari、脚本、CI/CD 等任何支持 Webhook 的系统配合使用。
- **安全**：密钥通过环境变量存储，不暴露在代码中。

## 📁 项目结构

```
feishu-proxy/
├── api/
│   └── webhook.js      # Serverless 函数入口
├── package.json        # 项目描述文件
└── README.md           # 本文件
```

## 🚀 部署到 Vercel

### 1. Fork 或克隆本仓库

将本项目上传到你的 GitHub 仓库。

### 2. 在 Vercel 中导入项目

- 登录 [Vercel](https://vercel.com)
- 点击 **Add New → Project**
- 选择你存放本项目的 GitHub 仓库
- 点击 **Import**

### 3. 配置环境变量

在 Vercel 项目设置中，添加以下两个环境变量：

| 变量名 | 说明 | 示例 |
| :--- | :--- | :--- |
| `FEISHU_SECRET` | 飞书机器人安全设置中的签名密钥 | `xxxxxxxxxxxxxxxx` |
| `FEISHU_WEBHOOK` | 飞书机器人完整的 Webhook 地址 | `https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx` |

> **注意**：环境变量添加后，需要重新部署一次（Redeploy）才能生效。

### 4. 部署

点击 **Deploy**，等待部署完成。Vercel 会分配一个域名，例如 `https://your-project.vercel.app`。

你的 Webhook 代理地址即为：

```
https://your-project.vercel.app/api/webhook
```

## 📡 使用方法

### 发送纯文本通知

```bash
curl -X POST https://your-project.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"服务器 CPU 使用率超过 90%"}'
```

### 发送普通文本（非 JSON）

```bash
curl -X POST https://your-project.vercel.app/api/webhook \
  -H "Content-Type: text/plain" \
  -d "服务器磁盘空间不足"
```

### 在 1Panel 中配置

1. 进入 **面板设置 → 告警通知**
2. 添加通知，类型选择 **Webhook**
3. 填写：
   - **URL**：`https://your-project.vercel.app/api/webhook`
   - **Method**：`POST`
   - **Content-Type**：`application/json`
   - **Body**：`{"text":"1Panel 告警：{{ .Title }} - {{ .Message }}"}`
4. 保存并测试。

### 在 Komari 中配置

1. 进入 **设置 → 通知**
2. 添加通知，类型选择 **Webhook**
3. 填写：
   - **URL**：`https://your-project.vercel.app/api/webhook`
   - **Method**：`POST`
   - **Content-Type**：`application/json`
   - **Body**：`{"text":"Komari 通知：{{ .Message }}"}`
4. 保存并测试。

### 在其他系统中配置

任何支持发送 HTTP POST 请求的系统都可以使用，只需将请求发送到代理地址，并在 Body 中包含消息文本即可。

## 🔐 安全说明

- **签名密钥**：务必通过 Vercel 环境变量配置，不要硬编码在代码中。
- **飞书安全设置**：建议在飞书机器人中开启 **签名校验**，并配合本代理使用。
- **关键词过滤**：如果飞书机器人使用了“自定义关键词”，请确保发送的消息内容包含该关键词（例如“通知”）。

## ⚠️ 注意事项

- Vercel Hobby 计划免费额度：每月 100 万次函数调用、100 GB 数据传输，个人使用完全足够。
- 函数执行超时默认为 10 秒，转发请求通常只需几百毫秒。
- 冷启动可能导致首次调用有短暂延迟（通常几百毫秒），不影响通知送达。

## 📄 许可证

MIT
```

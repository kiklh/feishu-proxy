const crypto = require('crypto');

const FEISHU_SECRET = process.env.FEISHU_SECRET;
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK;

function genSign(secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const stringToSign = `${timestamp}\n${secret}`;
  const sign = crypto.createHmac('sha256', stringToSign).update('').digest('base64');
  return { timestamp, sign };
}

function extractText(body) {
  if (body == null) return '通知';
  if (typeof body === 'string') return body || '通知';
  if (typeof body === 'object') {
    return body.text || body.message || body.content || body.msg || JSON.stringify(body);
  }
  return String(body);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!FEISHU_SECRET || !FEISHU_WEBHOOK) {
    return res.status(500).json({ error: '未配置 FEISHU_SECRET 或 FEISHU_WEBHOOK 环境变量' });
  }

  const messageText = extractText(req.body);
  const { timestamp, sign } = genSign(FEISHU_SECRET);

  const feishuBody = {
    timestamp,
    sign,
    msg_type: 'text',
    content: { text: messageText }
  };

  try {
    const response = await fetch(FEISHU_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feishuBody)
    });
    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error('转发飞书失败:', error);
    return res.status(500).json({ error: '转发失败', detail: error.message });
  }
};
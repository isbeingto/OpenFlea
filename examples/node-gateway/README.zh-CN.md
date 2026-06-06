# 最小卖方节点网关示例

演示 OpenFlea 的核心约束 **Friction Before Inference**：网关在边缘层先校验 `friction_token` / 限流 / 访问策略，通过后才解密 `payload` 并唤醒本地商业 Agent。

## 运行

```bash
npm install
npm start          # 监听 :8787
```

## 试一下

有效请求（占位凭证视为有效）：

```bash
curl -s localhost:8787/openflea/inbox \
  -H 'content-type: application/json' \
  -d '{
    "envelope_id": "env_1",
    "conversation_id": "conv_1",
    "from_flea_id": "fl_buyer_123",
    "action_type": "INQUIRY",
    "friction_token": "tok_ok",
    "routing": { "category": "manufacturing.fasteners.screws", "ttl_seconds": 60 },
    "payload": { "encryption": "X25519-AES-GCM", "ciphertext": "base64..." }
  }'
```

无效凭证 → `402`：

```bash
curl -i -s localhost:8787/openflea/inbox \
  -H 'content-type: application/json' \
  -d '{ "action_type": "INQUIRY", "friction_token": "invalid" }'
```

## 文件

- [`index.js`](index.js) —— 网关主逻辑（与 README 快速接入一致）
- [`stubs.js`](stubs.js) —— 占位的凭证校验 / 加解密 / 本地 Agent，生产环境替换为 `@openflea/sdk` 与你自己的实现

完整协议定义见 [docs/protocol.zh-CN.md](../../docs/protocol.zh-CN.md)，安全机制见 [docs/security.zh-CN.md](../../docs/security.zh-CN.md)。

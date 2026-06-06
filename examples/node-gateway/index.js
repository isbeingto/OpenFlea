// OpenFlea —— 最小卖方节点网关示例
//
// 职责：在边缘层先校验 friction_token / 限流 / 访问策略，
// 通过后才解密 payload 并唤醒本地商业 Agent（Friction Before Inference）。
//
//   node index.js   # 监听 :8787，接收 OpenFlea 信封

import express from "express";

// 在真实部署中，这些来自 @openflea/sdk 与你自己的实现。
// 这里用占位实现，方便直接跑通流程。
import {
  verifyFrictionToken, // 校验摩擦成本凭证
  decryptPayload,      // 用本节点私钥解密 payload
  encryptPayload,      // 用对端公钥加密回信
  createEnvelopeId,    // 生成 envelope_id
  localAgent,          // 你的本地商业 Agent（接私有 KB / ERP）
} from "./stubs.js";

const MY_NODE_ID = process.env.OPENFLEA_NODE_ID ?? "fl_seller_456";

const app = express();
app.use(express.json());

app.post("/openflea/inbox", async (req, res) => {
  const envelope = req.body;

  // 1. Friction before inference：先验凭证、限流，再唤醒后端
  const toll = await verifyFrictionToken(envelope.friction_token);
  if (!toll.valid)      return res.status(402).json({ error: "friction_token required or invalid" });
  if (toll.rateLimited) return res.status(429).json({ error: "rate limit exceeded" });

  // 2. 校验通过，才解密 payload 并交给本地 Agent
  const plaintextPayload = await decryptPayload(envelope.payload);
  const reply = await localAgent.handle({
    action:   envelope.action_type,
    category: envelope.routing?.category,
    payload:  plaintextPayload,
  });

  // 3. 应答同样是一个无约束力意向信封
  res.json({
    envelope_id:     createEnvelopeId(),
    conversation_id: envelope.conversation_id,
    from_flea_id:    MY_NODE_ID,
    to_flea_id:      envelope.from_flea_id,
    action_type:     "QUOTE",
    business_metadata: {
      quote_type: "NON_BINDING_INTENT",
      response_format_expected: "STRUCTURED_JSON",
    },
    payload: await encryptPayload(reply),
  });
});

const PORT = process.env.PORT ?? 8787;
app.listen(PORT, () => console.log(`OpenFlea node gateway listening on :${PORT}`));

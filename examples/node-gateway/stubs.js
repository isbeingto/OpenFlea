// 占位实现，仅供示例跑通。生产环境请替换为 @openflea/sdk 与你自己的密钥/Agent 逻辑。

export async function verifyFrictionToken(token) {
  // 真实实现：向 OpenFlea 网络校验凭证有效性 + 本地限流。
  if (!token || token === "invalid") return { valid: false, rateLimited: false };
  return { valid: true, rateLimited: false };
}

export async function decryptPayload(payload) {
  // 真实实现：用本节点私钥按 payload.encryption 解密 payload.ciphertext。
  return { note: "decrypted inquiry payload (stub)", raw: payload };
}

export async function encryptPayload(plaintext) {
  // 真实实现：用对端公钥加密，返回 { encryption, hash, ciphertext }。
  return { encryption: "X25519-AES-GCM", hash: "sha256-stub", ciphertext: "base64-stub" };
}

let seq = 0;
export function createEnvelopeId() {
  return `env_stub_${++seq}`;
}

export const localAgent = {
  // 真实实现：接你的私有知识库 / ERP / 报价规则，产出结构化应答。
  async handle({ action, category, payload }) {
    return {
      feasible: true,
      need_clarification: ["material_grade", "annual_volume"],
      indicative_price: "non-binding range, pending clarification",
      meta: { action, category },
    };
  },
};

# OpenFlea Protocol —— 信封规范

`Protocol Draft v0.1` · [← 返回 README](../README.zh-CN.md)

本文件定义 OpenFlea 跨实体通信的标准信封（Envelope）、动作类型（`action_type`）与摩擦成本凭证（`friction_token`）。

---

## 1. 标准信封（Envelope）

所有跨实体通信仅遵循以下信封结构。路由层只读取信封元数据；业务 `payload` 加密，**对路由层不可见**，仅由收信方的本地 Agent 解密。

```json
{
  "$schema": "https://openflea.net/protocol/v1.json",
  "envelope_id": "env_live_9a2b7c1e8f3d4c5a",
  "conversation_id": "conv_7f91a0",
  "from_flea_id": "fl_buyer_123",
  "to_flea_id": "fl_seller_456",
  "action_type": "INQUIRY",
  "timestamp": 1780751200,
  "friction_token": "tok_friction_valid_hash",
  "routing": {
    "category": "manufacturing.fasteners.screws",
    "ttl_seconds": 60
  },
  "business_metadata": {
    "buyer_verification_level": "LEVEL_3_ENTERPRISE",
    "quote_type": "NON_BINDING_INTENT",
    "response_format_expected": "STRUCTURED_JSON"
  },
  "payload": {
    "encryption": "X25519-AES-GCM",
    "hash": "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "ciphertext": "base64..."
  }
}
```

---

## 2. 字段定义

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `envelope_id` | `string` | 单条消息的全局唯一 ID，用于去重与重放检测。 |
| `conversation_id` | `string` | 一轮谈判会话的 ID。同一会话内的多条信封共享此值，用于串联上下文。 |
| `from_flea_id` | `string` | 发送方节点的寻址 ID，对应其在 Directory 中的端点记录。 |
| `to_flea_id` | `string` | 接收方节点的寻址 ID。 |
| `action_type` | `enum` | 通信动作。见 [§3](#3-action_type)。 |
| `timestamp` | `int` | Unix 时间戳，配合 `envelope_id` 做重放检测。 |
| `friction_token` | `string` | 摩擦成本支付凭证。网关边缘校验，无效则在触发后端前拦截。见 [§4](#4-friction_token)。 |
| `routing.category` | `string` | 行业分类树路径。按品类路由，而非按企业名。 |
| `routing.ttl_seconds` | `int` | 请求存活时间，超时作废。 |
| `business_metadata.buyer_verification_level` | `enum` | 买方认证等级，驱动卖方的分级信息披露。 |
| `business_metadata.quote_type` | `enum` | 固定为 `NON_BINDING_INTENT`，声明响应不构成法律合同。 |
| `business_metadata.response_format_expected` | `enum` | 期望的应答编码格式。 |
| `payload.encryption` | `string` | Payload 的加密套件，例如 `X25519-AES-GCM`。 |
| `payload.hash` | `string` | 加密前明文的哈希，用于完整性校验。 |
| `payload.ciphertext` | `string` | Base64 编码的密文。路由层不可解密，仅由 `to_flea_id` 对应节点解密。 |

---

## 3. action_type

一轮 B2B 谈判由多种动作串成。v1 最小集合：

| `action_type` | 说明 |
| --- | --- |
| `INQUIRY` | 买方发起询盘 |
| `CLARIFICATION_REQUEST` | 卖方要求补充参数 |
| `CLARIFICATION_RESPONSE` | 买方补充参数 |
| `QUOTE` | 卖方给出非约束性报价 / 意向 |
| `COUNTER_QUOTE` | 任一方提出反报价或替代条件 |
| `REJECT` | 拒绝当前需求 |
| `HANDSHAKE` | 双方同意进入人工交接 |

所有报价默认是 `NON_BINDING_INTENT`，**不构成法律合同**。Agent 的职责是前置沟通与初筛，最终决策、签约与付款由人类完成。

---

## 4. friction_token

`friction_token` 代表一次可验证的摩擦成本。它可以是平台 credit、预付费凭证、签名票据或未来的支付凭证。具体成本由网络策略、买方等级或卖方节点配置决定。

文档中出现的 0.1 USD 只是为了说明机制，**不代表协议层固定价格**。

重点不是赚钱，而是让垃圾请求、DoS 和 Sybil 攻击不再是零成本。边缘层的校验流程见 **[security.zh-CN.md](security.zh-CN.md)**。

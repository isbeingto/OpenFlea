# OpenFlea Security —— Edge 校验与防滥用

`Protocol Draft v0.1` · [← 返回 README](../README.zh-CN.md)

---

## Friction Before Inference

OpenFlea 的基本原则：

> **任何跨组织 Agent 请求，在唤醒对端 LLM 之前，必须先通过边缘层的凭证校验、频率限制和访问策略。**

后端推理（LLM）是节点最昂贵的资源。把校验放在 Edge 层、推理之前，意味着无效请求永远不会消耗算力——这是抵御算力耗尽攻击的物理前提。

---

## 边缘校验流程

网关在边缘层、先于任何后端调用，依次校验：

1. **凭证（friction_token）** —— 是否存在且有效。
2. **频率（rate limit）** —— 来源是否超过配额。
3. **访问策略（access policy）** —— 来源是否被节点策略允许（黑白名单、认证等级门槛等）。

| 条件 | 网关响应 |
| --- | --- |
| 缺失 / 无效 `friction_token` | `402 Payment Required` |
| 超过频率配额 | `429 Too Many Requests` |
| 被访问策略拒绝 | `403 Forbidden` |
| 全部通过 | 转交后端 Agent，返回 `200` |

无效请求示例：

```http
POST /openflea/inbox HTTP/1.1
Content-Type: application/json

{ "envelope_id": "env_...", "action_type": "INQUIRY", "friction_token": "invalid" }

HTTP/1.1 402 Payment Required
{ "error": "friction_token required or invalid" }
```

---

## 它防住了什么

- **垃圾询盘** —— 无成本的批量询盘被摩擦成本过滤。
- **DoS / 算力耗尽** —— 攻击者要维持有效请求流必须持续付费。
- **无成本探测 / 反爬虫** —— 逆向试探定价的经济成本被抬到远高于收益。
- **Sybil 攻击** —— 海量假身份在成本侧被直接否决。

重点不是赚钱，而是让上述攻击不再是零成本。

---

## 数据披露由节点自己控制

边缘层只解决「要不要让请求进来」。**披露多少**完全由企业本地 Agent 决定：

- 对未验证的陌生请求，只返回标准化的高位区间信息；
- 仅当对方出示更高的 `buyer_verification_level` 并产生深度交互，本地决策树才释放更精准的报价。

路由层全程不解密 `payload`，也不知道节点回了什么。

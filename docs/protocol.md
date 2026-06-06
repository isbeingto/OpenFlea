# OpenFlea Protocol — Envelope Specification

`Protocol Draft v0.1` · [← back to README](../README.md)

This document defines OpenFlea's standard envelope, action types (`action_type`), and friction-cost token (`friction_token`) for cross-entity communication.

---

## 1. The envelope

All cross-entity communication follows the envelope below. The routing layer reads only the envelope metadata; the business `payload` is encrypted, **invisible to the routing layer**, and decrypted only by the recipient's local agent.

```json
{
  "$schema": "https://openflea.net/protocol/v0.1.json",
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

## 2. Field definitions

| Field | Type | Purpose |
| --- | --- | --- |
| `envelope_id` | `string` | Globally unique ID of a single message; used for dedup and replay detection. |
| `conversation_id` | `string` | ID of one negotiation session. Envelopes in the same session share it, to thread context. |
| `from_flea_id` | `string` | Addressing ID of the sender node, matching its endpoint record in the Directory. |
| `to_flea_id` | `string` | Addressing ID of the recipient node. |
| `action_type` | `enum` | Communication act. See [§3](#3-action_type). |
| `timestamp` | `int` | Unix timestamp; with `envelope_id`, used for replay detection. |
| `friction_token` | `string` | Friction-cost credential. Verified at the gateway edge; if invalid, the request is blocked before reaching the backend. See [§4](#4-friction_token). |
| `routing.category` | `string` | Path in the industry category tree. Routes by category, not by company name. |
| `routing.ttl_seconds` | `int` | Request time-to-live; expires after. |
| `business_metadata.buyer_verification_level` | `enum` | Buyer verification level; drives the seller's tiered disclosure. |
| `business_metadata.quote_type` | `enum` | Fixed to `NON_BINDING_INTENT`; declares the response is not a legal contract. |
| `business_metadata.response_format_expected` | `enum` | Expected reply encoding format. |
| `payload.encryption` | `string` | Payload cipher suite, e.g. `X25519-AES-GCM`. |
| `payload.hash` | `string` | Hash of the plaintext before encryption, for integrity checking. |
| `payload.ciphertext` | `string` | Base64-encoded ciphertext. The routing layer cannot decrypt it; only the node addressed by `to_flea_id` can. |

---

## 3. action_type

A round of B2B negotiation is a chain of acts. The v0.1 minimal set:

| `action_type` | Description |
| --- | --- |
| `INQUIRY` | Buyer initiates an inquiry |
| `CLARIFICATION_REQUEST` | Seller asks for more parameters |
| `CLARIFICATION_RESPONSE` | Buyer supplies the parameters |
| `QUOTE` | Seller gives a non-binding quote / intent |
| `COUNTER_QUOTE` | Either side proposes a counter-offer or alternative terms |
| `REJECT` | Reject the current request |
| `HANDSHAKE` | Both sides agree to move to a human handoff |

Every quote defaults to `NON_BINDING_INTENT` and **does not constitute a legal contract**. An agent's job is front-end communication and first-pass screening; the final decision, contract, and payment are done by humans.

---

## 4. friction_token

A `friction_token` represents one verifiable unit of friction cost. It may be a platform credit, a prepaid voucher, a signed ticket, or a future payment proof. The actual cost is set by network policy, buyer tier, or seller-node configuration.

The 0.1 USD mentioned across the docs is only to illustrate the mechanism and **does not represent a fixed protocol-level price**.

The point isn't revenue — it's making junk requests, DoS, and Sybil attacks no longer free. For the edge verification flow, see **[security.md](security.md)**.

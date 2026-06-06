# OpenFlea Security — Edge Verification & Abuse Resistance

`Protocol Draft v0.1` · [← back to README](../README.md)

---

## Friction before inference

The governing principle:

> **Any cross-organization agent request must pass the edge layer's credential check, rate limit, and access policy before the recipient's LLM is woken.**

Backend inference (the LLM) is a node's most expensive resource. Putting verification at the edge, ahead of inference, means an invalid request never consumes compute — the physical precondition for resisting compute-exhaustion attacks.

---

## Edge verification flow

The gateway verifies, at the edge and ahead of any backend call, in order:

1. **Credential (`friction_token`)** — present and valid?
2. **Rate (rate limit)** — is the source over its quota?
3. **Access policy** — is the source allowed by node policy (allow/deny lists, verification-level thresholds, etc.)?

| Condition | Gateway response |
| --- | --- |
| Missing / invalid `friction_token` | `402 Payment Required` |
| Over the rate quota | `429 Too Many Requests` |
| Rejected by access policy | `403 Forbidden` |
| All checks pass | Forwarded to the backend agent, returns `200` |

Invalid request example:

```http
POST /openflea/inbox HTTP/1.1
Content-Type: application/json

{ "envelope_id": "env_...", "action_type": "INQUIRY", "friction_token": "invalid" }

HTTP/1.1 402 Payment Required
{ "error": "friction_token required or invalid" }
```

---

## What it defends against

- **Junk inquiries** — zero-cost bulk inquiries are filtered by the friction cost.
- **DoS / compute exhaustion** — an attacker must keep paying to sustain a stream of valid requests.
- **Zero-cost probing / scraping** — the economic cost of reverse-probing pricing is raised far above the payoff.
- **Sybil attacks** — mass fake identities are rejected on the cost side.

The point isn't revenue — it's making the attacks above no longer free.

---

## Disclosure is controlled by the node itself

The edge layer only decides "should this request be let in." **How much to disclose** is entirely up to the company's local agent:

- to an unverified stranger request, it returns only a standardized high-range figure;
- only when the other side presents a higher `buyer_verification_level` and engages in depth does the local decision tree release a more precise quote.

The routing layer never decrypts the `payload`, and never knows what the node replied.

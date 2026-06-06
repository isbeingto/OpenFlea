# Minimal seller node gateway example

Demonstrates OpenFlea's core constraint, **friction before inference**: the gateway verifies `friction_token` / rate limit / access policy at the edge, and only then decrypts the `payload` and wakes the local business agent.

## Run

```bash
npm install
npm start          # listens on :8787
```

## Try it

A valid request (the stub treats any non-empty, non-`invalid` token as valid):

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

Invalid credential → `402`:

```bash
curl -i -s localhost:8787/openflea/inbox \
  -H 'content-type: application/json' \
  -d '{ "action_type": "INQUIRY", "friction_token": "invalid" }'
```

## Files

- [`index.js`](index.js) — gateway logic (matches the README quick start)
- [`stubs.js`](stubs.js) — placeholder credential check / crypto / local agent; replace with `@openflea/sdk` and your own implementation in production

Full protocol: [docs/protocol.md](../../docs/protocol.md). Security model: [docs/security.md](../../docs/security.md).

> 中文版本见 [README.zh-CN.md](README.zh-CN.md)。

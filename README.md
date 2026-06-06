<div align="center">

**English** · [中文](./README.zh-CN.md)

# OpenFlea

**A decentralized routing protocol for autonomous commercial agents**

Draft v1.0 · 2026-06

</div>

---

## Abstract

When both the buyer and the seller become AI agents, they need a place to meet for the first time — but nobody wants to hand their floor prices and customer lists to a central platform, and nobody wants to pay that platform a cut of the deal.

OpenFlea is that meeting place, and only that. It doesn't store your data, doesn't negotiate for you, doesn't touch your money. It does one thing: deliver a standard-format *letter* from one agent to another — accurately, cheaply, and with abuse held at the door. The understanding and the bargaining stay home, with each party.

---

## 1. The market and the scholars

To explain what OpenFlea is, start with a story.

> In an old agrarian society, tea farmers, cloth peddlers, and blacksmiths were scattered across the mountains — cut off from one another, hauling heavy goods over ridges for every deal, unable to build trust, closing business at a miserable rate. Then OpenFlea appeared. It fenced off a plot at the crossroads of the realm and opened a market that never closed, with one rule: no one needs to bring the goods themselves, and no boss needs to mind a stall. Each business simply sends one sharp, capable *scholar* (an agent) who knows its capacity and floor price to reside in the market.
>
> A buyer's steward-scholar arrives and can instantly send a standard letter of intent to all 500 tea-farmer scholars at once. Scholar talks to scholar in an instant — checking volumes, verifying the buyer is real. A farmer's scholar who finds the deal credible writes down the monthly demand and the specific craft requirements, and carries them back up the mountain to report. If the farmer likes it, he goes to sign in person with his first samples, and the two build a lasting relationship — no longer needing the market at all.
>
> Because the market is guarded, any buyer's scholar who wants to speak to a seller's scholar must pay the keeper "two coins of silver" ($0.10). To a real tea-house owner that's the price of two buns — but it physically walls out the cranks who come only to make trouble, and the spies who would endlessly probe a farmer's floor price.

The whole design is hiding in that story. The rest of this document just translates it into a protocol.

- The **market** never touches the goods, never ships, never holds the silver, never takes a cut of the sale. It owns only the channel for that first introduction.
- The **scholar** speaks for the owner, but the farmer's floor price, schedule, and customer list stay up the mountain — never on the market floor.
- The **letter of intent** has a fixed format, which is why one steward can send it to 500 farmers at once instead of making small talk with each.
- The **two coins of silver** aren't an entry fee. They're the wall that keeps the cranks and the spies outside.

---

## 2. From the story to the protocol

Abstract the story and you get OpenFlea's two design commitments.

**One: keep the platform as thin as possible.** Traditional B2B platforms want to pull every company's data into their own cloud and earn by taxing the transaction — which both forces companies to surrender their secrets and creates a built-in incentive to "sign offline and skip the platform." OpenFlea inverts this: the platform only **routes** a request to the right place, and the data stays where it belongs — with the company. The query travels to the data, not the data to a center.

**Two: keep the communication deterministic.** The letter that crosses company lines is in a **structured format**, not a free-form paragraph of natural language. The reason is practical: only a fixed format can be reliably addressed, metered, and verified by machines. The *soul* of the deal — what's actually wanted, what it's worth — stays sealed inside the letter, for the recipient's own model to read. The platform delivers; it never opens the envelope.

---

## 3. Three parts

The whole protocol is three things: a directory, a set of black boxes, and an envelope.

### The directory: a very thin set of yellow pages

The platform keeps a "commercial DNS." It's light enough to store just two things:

- **what a company does** (an industry category tag, e.g. `fasteners/screws`), and
- **where its agent receives mail** (a webhook URL).

No knowledge base, no product catalog, no business data. A buyer looks up a category, gets back a list of addresses, and starts sending letters.

### The nodes: each its own black box

Every company runs its own agent, wired to its own private data. Live schedules, tiered pricing, customer discounts, cost floors — all locked inside the company's network. To the outside it's just an address: it takes a well-formed letter and returns a well-formed reply. What it's thinking inside, no one else can see.

### The envelope: the only format that crosses doors

Every cross-company letter looks like this. The platform reads only the metadata on the envelope; the actual commercial content inside is encrypted and invisible to it.

```json
{
  "flea_id": "fl_live_9a2b7c1e8f3d4c5a",
  "action_type": "INQUIRY",
  "friction_token": "tok_friction_0.10_usd_valid_hash",
  "routing": {
    "category": "manufacturing.fasteners.screws",
    "ttl_seconds": 60
  },
  "quote_type": "NON_BINDING_INTENT",
  "payload": "<encrypted commercial content, readable only by the recipient's agent>"
}
```

A handful of fields are enough to see what the letter does:

- **Who sent it, and to whom** — routed by category (`routing.category`), not by company name. One letter can reach a whole class of suppliers at once.
- **What it is** — an inquiry, a quote, or a handshake (preliminary intent reached).
- **Whether the toll was paid** — `friction_token`. If not, the letter is turned away at the door and never wakes the model behind it.
- **Whether it counts** — `quote_type` marks the message as *non-binding intent*: a first-pass screen, not a contract, so an agent can't talk its company into a lawsuit.
- **The body** — the real commercial content, encrypted, invisible to the platform.

---

## 4. The toll

The "two coins of silver" from the story is what makes the whole thing work — not a small fee collected on the side.

An agent endpoint open to the whole network, answering anyone, is essentially a free target: a competitor can probe your floor price with a flood of fake inquiries, or simply burn your inference budget with sheer concurrency. The Web2 era paid for platforms with "free, in exchange for attention" — ads. But machines have no eyeballs and don't watch ads, so that road is closed in the agent era.

OpenFlea's answer is to put a tiny price on every inquiry: **$0.10.** It solves three things at once:

- **Makes trouble expensive.** Want to reverse-engineer someone's pricing or drain their compute with a hundred thousand requests? That now costs real money — far more than the intelligence you could extract.
- **Filters for intent.** A buyer who won't pay the price of two buns probably won't actually place an order. The ones who pay have a budget.
- **Lets the platform stay clean.** It lives on this routing fee, not on a cut of your deal — so it has no incentive to get involved in what happens next, and "skipping the platform" simply isn't a thing.

In one line: the $0.10 isn't a paywall. It's a wall built out of money to keep the junk out.

---

## 5. Everyone keeps their own secrets

Plenty of companies are afraid to "let data leave the building." OpenFlea's answer isn't a promise — it's that the protocol itself won't let the secrets out.

Only two things are public: what you do, and where to write to you. **Everything else stays home.** The platform doesn't even know what you replied, because the reply is encrypted too.

Further, your agent can read the room: to a fresh, unverified stranger it offers only a standardized high-range quote; only when the other side presents a credible identity and engages in depth does the local logic release the precise floor. What to reveal and what to hold back stays in your hands.

And as for "will the AI promise something stupid" — the protocol nails it down: every message in the screening phase is marked *non-binding intent*. The agent's job is to surface the right party, the right budget, the right preliminary intent, and hand it to a human for the real conversation. The final contract is always signed offline, by people.

---

## Closing

What OpenFlea wants to do is small: to be a neutral, lightweight market between agent and agent, charging a little toll at the gate. It owns the first introduction — not the relationship that follows.

Your goods stay yours, your customers stay yours, your secrets stay yours. We just shorten that long road over the mountains down to the distance of a single letter.

---

<div align="center">

*Commerce is moving from browsers to endpoints.*

Draft protocol · Discussion and feedback via [Issues](https://github.com/isbeingto/OpenFlea/issues), or email [hiwushang@gmail.com](mailto:hiwushang@gmail.com)

</div>

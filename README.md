# Vonage @ CX Tour KL 2026

A **mobile-first event microsite** built for the Genesys CX Tour Kuala Lumpur 2026 (23 June, W Kuala Lumpur), where Vonage attends as Gold Partner. Visitors scan a QR code at the booth, register, explore Vonage's products, interact with an AI assistant, and optionally request a 1-on-1 meeting — all tracked in a real-time admin dashboard.

---

## User Journey

```
QR Code scan → Registration → Product Hub → AI Chat / Meeting Request
```

1. **Welcome & Registration** (`/`) — visitor enters name + email, selects language (EN / BM / 中文). Saves them as a named contact in the database.
2. **Product Hub** (`/hub`) — personalised hub showing two expandable product cards (Branded Calling & Network APIs), each with key benefits and resource links (website, video, PDF).
3. **AI Chat** — floating chat button opens a panel powered by Claude. Visitors can ask questions about Vonage products in their language.
4. **Meeting Request** — a one-tap CTA lets visitors signal interest in a 1-on-1 conversation with the Vonage team.

---

## Key Features

### Multilingual
UI and AI responses fully supported in **English, Bahasa Malaysia, and Simplified Chinese**. Language is set at registration and carried through the entire session, including AI chat.

### AI Agent — Scoped & Token-Controlled
The chat assistant is powered by **Anthropic Claude Haiku** and is deliberately locked down:

- **Scope lock** — the agent is instructed via system prompt to only answer questions about Vonage Branded Calling, Vonage Network APIs, and the event context. Any off-topic question is politely declined and redirected.
- **Turn limit** — each visitor is limited to **5 conversation turns** per session, preventing runaway usage.
- **Token budget** — responses are capped at **300 tokens** per reply (roughly 2–4 sentences), keeping interactions concise and cost-efficient.
- **Billing** — the agent runs on a **personal Anthropic account, billed per token used** (pay-as-you-go). Monitor usage at [console.anthropic.com](https://console.anthropic.com) to track event spend. Estimated cost: **< $2 for a full event day** with Claude Haiku pricing.

The agent's role is to act as a **knowledgeable product companion** at the booth: answer common questions instantly in the visitor's language, highlight Branded Calling and Network APIs key benefits, and encourage visitors to request a meeting with the team when appropriate.

### Full Contact Attribution
Every interaction — product views, resource clicks, chat messages — is linked back to the registered contact where possible, giving the team a complete picture of each visitor's journey.

### Real-Time Funnel Visibility
The admin dashboard tracks drop-off at every step: QR scan → registration → product exploration → AI chat → meeting request.

### No App Install
Runs entirely in the mobile browser via QR code. No download, no friction.

### Privacy-Light
Only name and email are collected. No tracking pixels, no third-party scripts, no cookies beyond session storage.

---

## Admin Dashboard (`/admin`)

Password-protected. Four tabs:

| Tab | What it shows |
|---|---|
| **Overview** | Key metrics (QR scans, registrations, meetings, chats), visitor funnel with conversion bars, language breakdown |
| **Contacts** | Full registrant list with chat count, meeting status, language — exportable as CSV |
| **Chats** | Every AI conversation grouped by contact, fully readable with timestamps and role labels |
| **Analytics** | Resource click breakdown, product interest (Branded Calling vs. Network APIs), recent event feed |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom dark glassmorphism design system |
| Database | Supabase (PostgreSQL) with Row Level Security |
| AI | Anthropic Claude Haiku 4.5 — pay-per-token via personal account |
| Hosting | Vercel-ready (static pages + serverless API routes) |
| i18n | Built-in — English, Bahasa Malaysia, Simplified Chinese |

---

## Database Schema

| Table | Purpose |
|---|---|
| `contacts` | Registrants: name, email, language, meeting_requested |
| `analytics_events` | Page views, product views, resource clicks (session-level) |
| `chat_messages` | Every AI chat turn, linked to contact_id when available |

---

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-setup.sql` in the SQL Editor
3. Copy the project URL, anon key, and service role key

### 2. Anthropic API Key
Get from [console.anthropic.com](https://console.anthropic.com) — billed per token on pay-as-you-go

### 3. Environment Variables
```
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, ADMIN_PASSWORD
```

### 4. Deploy to Vercel
Push to GitHub → connect at [vercel.com](https://vercel.com) → add env vars in project settings.
Or run `npx vercel` locally.

### 5. QR Code
Generate a QR code pointing to the deployed URL and print it for the booth.

---

## Next Actions

- [ ] **Improve messages & spiels** — review and refine the AI system prompt, product descriptions, taglines, and CTA copy for each language
- [ ] **Add marketing material & media** — attach real video links, PDF datasheets, and product images to the resource cards (replace `href: '#'` placeholders in `app/hub/page.tsx`)
- [ ] **Test flow internally** — run through the full journey (QR → register → hub → chat → meeting request) on mobile, verify the admin dashboard populates correctly, and stress-test the AI agent with edge-case questions
- [ ] Deploy to Vercel and generate the final QR code pointing to the live URL
- [ ] Share the admin password securely with the on-site team

---

## Routes

| Path | Description |
|---|---|
| `/` | Registration page |
| `/hub` | Product hub, AI chat, meeting CTA |
| `/admin` | Password-protected admin dashboard |

# Vonage @ CX Tour KL & Taipei 2026

A **mobile-first event microsite** built for the Genesys CX Tour Kuala Lumpur & Taipei 2026 (23 June KL, 26 June Taipei — W Kuala Lumpur), where Vonage attends as Gold Partner. Visitors scan a QR code at the booth, register, explore Vonage's products, interact with an AI assistant, and optionally request a 1-on-1 meeting — all tracked in a real-time admin dashboard.

---

## User Journey

```
QR Code scan → Registration → Product Hub → AI Chat / Meeting Request → Thank You
```

1. **Welcome & Registration** (`/`) — visitor enters name + email, selects language (EN / 繁體中文), picks solution interests. Saves them as a named contact in the database.
2. **Product Hub** (`/hub`) — personalised hub showing two tabbed product cards (Branded Communications & Network APIs), each with key benefits and resource links (datasheets, videos, AppFoundry).
3. **AI Chat** — floating chat button opens a panel powered by Google Gemini. Visitors can ask questions about Vonage products in their language.
4. **Meeting Request** (`/meeting`) — form to request a 1-on-1 conversation with the Vonage BDM, with optional meeting notes.
5. **Thank You** (`/thank-you`) — confirmation page after meeting request.

---

## Key Features

### Multilingual
UI and AI responses fully supported in **English and Traditional Chinese (繁體中文)**. Language is set at registration and carried through the entire session, including AI chat.

### AI Agent — Scoped & Token-Controlled
The chat assistant is powered by **Google Gemini 3.5 Flash** and is deliberately locked down:

- **Scope lock** — the agent is instructed via system prompt to only answer questions about Vonage Branded Communications, Vonage Network APIs, and the event context. Any off-topic question is politely declined and redirected.
- **Turn limit** — each visitor is limited to **5 conversation turns** per session (enforced server-side), preventing runaway usage.
- **Token budget** — responses are capped at **300 tokens** per reply (roughly 2–4 sentences), keeping interactions concise and cost-efficient.
- **Server-side history** — chat history is stored and retrieved from the database, preventing client-side manipulation.

The agent's role is to act as a **knowledgeable product companion** at the booth: answer common questions instantly in the visitor's language, highlight Branded Communications and Network APIs key benefits, and encourage visitors to request a meeting with the team when appropriate.

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

Password-protected. Five tabs:

| Tab | What it shows |
|---|---|
| **Overview** | Key metrics (QR scans, registrations, meetings, chats), visitor funnel with conversion bars, language breakdown |
| **Contacts** | Full registrant list with chat count, meeting status, language — exportable as CSV |
| **Chats** | Every AI conversation grouped by contact, fully readable with timestamps and role labels |
| **Analytics** | Resource click breakdown, product interest (Branded Communications vs. Network APIs), recent event feed |
| **AI Config** | API key status, model configuration, system prompt, usage statistics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + custom dark glassmorphism design system |
| Database | Supabase (PostgreSQL) with Row Level Security |
| AI | Google Gemini 3.5 Flash via `@google/generative-ai` SDK |
| Hosting | Vercel-ready (static pages + serverless API routes) |
| i18n | Built-in — English, Traditional Chinese |

---

## Database Schema

| Table | Purpose |
|---|---|
| `contacts` | Registrants: name, first_name, last_name, email, phone, language, solutions[], meeting_requested, meeting_note |
| `analytics_events` | Page views, product views, resource clicks (session_id, contact_id, event_type, event_data) |
| `chat_messages` | Every AI chat turn, linked to contact_id when available |

---

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-setup.sql` in the SQL Editor
3. Copy the project URL, anon key, and service role key

### 2. Google API Key
Get from [Google AI Studio](https://aistudio.google.com/apikey) — enables Gemini 3.5 Flash for the chat agent.

### 3. Environment Variables
```
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY, ADMIN_PASSWORD
```

### 4. Deploy to Vercel
Push to GitHub → connect at [vercel.com](https://vercel.com) → add env vars in project settings.
Or run `npx vercel` locally.

### 5. QR Code
Generate a QR code pointing to the deployed URL and print it for the booth.

---

## Routes

| Path | Description |
|---|---|
| `/` | Registration page (3-step wizard) |
| `/hub` | Product hub, AI chat, meeting CTA |
| `/meeting` | Meeting request form |
| `/thank-you` | Confirmation page |
| `/admin` | Password-protected admin dashboard |

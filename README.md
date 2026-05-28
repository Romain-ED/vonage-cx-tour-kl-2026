# Vonage Event App — CX Tour KL 2026

Multilingual event web app for the Genesys CX Tour Kuala Lumpur 2026.
Built with Next.js, Supabase, and Claude AI (Haiku).

## Features
- Registration (name + email → Supabase)
- Product Hub: Branded Calling & Network APIs (expandable cards)
- AI Chatbot (Claude Haiku, scoped to Vonage products, 5 questions/session)
- Meeting Request toggle (tags user in DB)
- 3 Languages: English, Bahasa Malaysia, Mandarin
- Admin panel at /admin with CSV export

## Setup

### 1. Supabase
1. Create project at supabase.com
2. Run `supabase-setup.sql` in the SQL Editor
3. Copy URL, anon key, and service role key

### 2. Anthropic API Key
Get from console.anthropic.com → ~$1 for the whole event with Haiku

### 3. Environment Variables
cp .env.local.example .env.local
Fill in your keys in .env.local

### 4. Deploy to Vercel
Push to GitHub → connect at vercel.com → add env vars in project settings
Or: npx vercel

## Routes
- / — Registration
- /hub — Product hub, chatbot, meeting CTA
- /admin — Password-protected admin panel

## Adding Real Content
Replace href:'#' placeholders in app/hub/page.tsx with real video/PDF links.
Generate QR code pointing to your deployed URL.

## Estimated Cost: < $2 for a full event day

# NeonArtist — Project Context

## What This Is
NeonArtist (neonartist.app) is an AI music course landing page and tool. Built and owned by Anton (antonbengtssonmusic@gmail.com). The site collects sales via Gumroad and has an AI Prompt & Lyric Generator for course buyers.

## Infrastructure
- **Hosting:** Cloudflare Workers (free) — deploy with `npx wrangler deploy`
- **Domain:** neonartist.app — nameservers at Cloudflare (craig / michelle)
- **Domain registrar:** Lovable
- **Worker name:** neonartist (account: neonartistai@gmail.com)
- **Workers.dev URL:** neonartist.neonartistai.workers.dev
- **GitHub:** https://github.com/AntonBengtssonMusic/NeonArtist

## Pages
- `/` → index.html — Main sales landing page
- `/waitlist` → waitlist.html — Mailchimp signup form
- `/generator` → served inline from worker.js — AI Prompt & Lyric Generator (locked)
- `/generator?access=neonartist2026` → unlocked generator for course buyers

## Key Files
- `worker.js` — Cloudflare Worker: serves /generator inline, handles /api/generate POST
- `index.html` — Main landing/sales page
- `waitlist.html` — Mailchimp waitlist page
- `generator.html` — Generator UI (static asset, lock shown/hidden via JS)
- `index-sales-preview.html` — Local preview of updated sales page (not yet live)
- `launch-email-preview.html` — Local preview of waitlist launch email
- `.dev.vars` — Local secrets (never committed to GitHub)
- `.assetsignore` — Files excluded from Cloudflare asset uploads
- `wrangler.jsonc` — Cloudflare config

## Deployment
Always deploy via:
```
CLOUDFLARE_API_TOKEN="<token>" npx wrangler deploy
```
On Windows use `$env:CLOUDFLARE_API_TOKEN="..."` prefix instead.
The Cloudflare API token is stored in Anton's password manager — ask him for it.

## Secrets
- Cloudflare API Token: stored in Anton's password manager (not in this file)
- Anthropic API Key: set as Cloudflare Worker secret (env.ANTHROPIC_API_KEY)

## Generator
- Served inline from worker.js — NOT as a static asset priority issue
- Calls `/api/generate` (POST) on the same Worker
- Uses `claude-haiku-4-5-20251001` via Anthropic API
- Prompts never mention artist names — describes style instead
- Prompts always under 1000 characters
- Lock overlay shown by JS when `?access=neonartist2026` is missing

## Payments
- Gumroad: https://neonbrush4.gumroad.com/l/NeonArtist
- Price: $199 (founding member), was $397

## Emails
- Mailchimp audience for waitlist signups
- Launch email template: launch-email-preview.html

## Meta Pixel
- Pixel ID: 926488228247986 — on all pages

## Pending / In Progress
- index-sales-preview.html is ready to go live as the new index.html — waiting for Anton's go-ahead
- launch-email-preview.html is ready to send to the Mailchimp list

# Deployment Design — Keystimate (keystimate.com)

**Date:** 2026-03-15
**Status:** Approved

---

## Overview

Deploy the Keystimate planning poker app (React SPA + Node.js/Socket.io server) to production using a single Netcup VPS, with Cloudflare for domain registration, DNS, and email routing. CI/CD via GitHub Actions auto-deploys on push to `main`.

---

## Infrastructure

### Hosting — Netcup VPS 500 G12
- **OS:** Ubuntu 24.04 LTS
- **Cost:** ~€3.50/month
- **Runs:** Nginx (reverse proxy + static files) + Node.js server (PM2) + Certbot (SSL)

### Domain — Cloudflare Registrar
- **Domain:** `keystimate.com`
- **Cost:** ~$10.44/year (at-cost, no markup)
- **DNS provider:** Cloudflare (automatic when buying through registrar)

### Email — Cloudflare Email Routing (free)
- `help@keystimate.com` forwards to personal inbox
- No mail server required
- Future upgrade path: Zoho Mail (free) or Google Workspace ($6/mo) for send capability — zero migration, just DNS records added

### Future Payments
- Stripe via npm package on existing Node.js server
- No infrastructure changes required — add `/webhook` route when needed

---

## Architecture

```
GitHub (main branch)
       │ git push
       ▼
GitHub Actions
   ├── Build client → rsync dist/ to VPS
   └── SSH → git pull + npm ci + pm2 restart
       │
       ▼
Netcup VPS (Ubuntu 24.04)
   ├── Nginx :80/:443
   │     ├── keystimate.com        → /var/www/keystimate/dist/ (static)
   │     └── api.keystimate.com    → localhost:3000 (Node proxy)
   ├── Node.js :3000 (PM2)
   └── Certbot (auto-renewing SSL)

Cloudflare
   ├── DNS: keystimate.com + api.keystimate.com → VPS IP
   └── Email Routing: help@keystimate.com → personal inbox
```

---

## DNS Records

| Type | Name | Value |
|------|------|-------|
| A | `@` | `<VPS IP>` |
| A | `api` | `<VPS IP>` |
| CNAME | `www` | `keystimate.com` |

---

## CI/CD — GitHub Actions

**Trigger:** push to `main`

**Steps:**
1. Checkout repo
2. `cd client && npm ci && npm run build`
3. `rsync` built `dist/` to `/var/www/keystimate/dist/` on VPS
4. SSH into VPS: `cd /var/www/keystimate/server && git pull && npm ci --production && pm2 restart keystimate-server`

**Secrets stored in GitHub Actions (never in repo):**
- `VPS_HOST` — VPS IP address
- `VPS_USER` — SSH user
- `VPS_SSH_KEY` — private SSH key for deploy
- All Firebase + app env vars injected into VPS `.env` on first setup (not re-deployed on every push)

---

## VPS Setup Steps (one-time)

1. **Order VPS** — Netcup VPS 500 G12, Ubuntu 24.04
2. **Secure server** — SSH key auth only, disable password login, UFW firewall (ports 22, 80, 443)
3. **Install runtime** — Node.js 20 LTS (via nvm), PM2 (global)
4. **Install Nginx + Certbot**
5. **Clone repo** — `/var/www/keystimate/`
6. **Configure `.env`** — server env vars in `/var/www/keystimate/server/.env`
7. **Configure Nginx** — two server blocks: static SPA + API proxy
8. **Obtain SSL certs** — `certbot --nginx` for both domains
9. **Start server** — `pm2 start index.js --name keystimate-server && pm2 save && pm2 startup`
10. **Set up GitHub Actions** — add deploy workflow + secrets

---

## Deployment Flow (ongoing)

```
git push origin main  →  GitHub Actions  →  live in ~60s
```

**Rollback:** SSH → `git checkout <prev-commit>` → `pm2 restart keystimate-server`

---

## Cost Summary

| Service | Cost |
|---------|------|
| Netcup VPS 500 G12 | ~€3.50/month |
| keystimate.com domain | ~$0.87/month ($10.44/year) |
| Cloudflare Email Routing | Free |
| SSL (Let's Encrypt) | Free |
| CI/CD (GitHub Actions) | Free |
| **Total** | **~€4.40/month** |

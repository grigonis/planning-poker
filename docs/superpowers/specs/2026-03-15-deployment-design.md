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
- No mail server required — receive-only forwarding
- **Future upgrade path for sending:** Zoho Mail (free) or Google Workspace ($6/mo) — no migration, just add DNS records

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
   ├── Build client (npm run build) with VITE_* secrets injected
   ├── rsync dist/     → VPS:/var/www/keystimate/dist/
   └── rsync server/   → VPS:/var/www/keystimate/server/ (excl. node_modules)
       └── SSH: npm ci --omit=dev + pm2 restart
       │
       ▼
Netcup VPS (Ubuntu 24.04)
   ├── Nginx :80/:443
   │     ├── keystimate.com        → /var/www/keystimate/dist/ (static SPA)
   │     │   └── try_files for React Router client-side routing
   │     └── api.keystimate.com    → localhost:3000 (Node proxy, WebSocket-aware)
   ├── Node.js :3000 (PM2, process name: keystimate-server)
   └── Certbot (auto-renewing SSL for both domains)

Cloudflare
   ├── DNS: keystimate.com + api.keystimate.com → VPS IP
   │   └── api subdomain MUST be "DNS only" (grey cloud) — see DNS section
   └── Email Routing: help@keystimate.com → personal inbox
```

---

## DNS Records

| Type | Name | Value | Proxy status |
|------|------|-------|--------------|
| A | `@` | `<VPS IP>` | Proxied (orange) ✓ |
| A | `api` | `<VPS IP>` | **DNS only (grey) ⚠️** |
| CNAME | `www` | `keystimate.com` | Proxied (orange) ✓ |

> **Why `api` must be DNS only:** Cloudflare's free plan proxy can drop long-lived WebSocket connections and its default "Flexible" SSL mode conflicts with Certbot-issued certs on the VPS. Setting `api.keystimate.com` to DNS only lets Nginx + Certbot handle TLS end-to-end, which is required for reliable Socket.io operation. The apex domain and `www` can remain proxied for DDoS protection since they serve static files only.

> **Note on `www` CNAME:** Cloudflare automatically flattens the CNAME to an A record (CNAME flattening). This is normal — the Cloudflare UI may show it differently than expected.

---

## Environment Variables

Environment variables split into two groups — this distinction is critical:

### Group 1 — Build-time (GitHub Actions secrets, used during `npm run build`)
Vite bakes these into the compiled JavaScript bundle. They are **not** read from any file on the VPS at runtime. If missing during build, they will be `undefined` in production.

| Variable | Example value |
|---|---|
| `VITE_FIREBASE_API_KEY` | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `keystimate.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `keystimate` |
| `VITE_SERVER_URL` | `https://api.keystimate.com` |
| `VITE_FIREBASE_EMAIL_LINK_URL` | `https://keystimate.com` |

### Group 2 — Runtime (stored in `server/.env` on VPS, read by Node.js process)

| Variable | Example value | Notes |
|---|---|---|
| `PORT` | `3000` | **Required** — server defaults to 5000 if unset |
| `NODE_ENV` | `production` | **Required** — enables CORS_ORIGIN check |
| `CORS_ORIGIN` | `https://keystimate.com` | **Required** — server exits on startup if missing in production |
| `FIREBASE_PROJECT_ID` | `keystimate` | |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...` | |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY..."` | Wrap in double quotes in .env file |

---

## CI/CD — GitHub Actions

**Trigger:** push to `main`

**Steps:**
1. Checkout repo
2. `cd client && npm ci`
3. Build: `npm run build` (with all `VITE_*` secrets injected as env vars)
4. `rsync -avz --delete client/dist/` → `vps:/var/www/keystimate/dist/`
5. `rsync -avz --delete --exclude='node_modules' server/` → `vps:/var/www/keystimate/server/`
6. SSH into VPS:
   ```bash
   cd /var/www/keystimate/server
   npm ci --omit=dev
   pm2 restart keystimate-server
   ```

**GitHub Actions secrets required:**
- `VPS_HOST` — VPS IP address
- `VPS_USER` — deploy user (e.g. `deploy`)
- `VPS_SSH_KEY` — private SSH key (corresponding public key added to VPS `~/.ssh/authorized_keys`)
- All Group 1 `VITE_*` variables above

---

## VPS Setup Steps (one-time)

### 1. Order VPS
- Netcup VPS 500 G12, Ubuntu 24.04 LTS
- Note the assigned IP address

### 2. Secure the server
SSH in as root, then:
```bash
# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Copy your SSH public key
mkdir -p /home/deploy/.ssh
echo "<YOUR_PUBLIC_KEY>" >> /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

# Disable password auth and root login
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PermitRootLogin no
systemctl restart sshd

# Firewall — allow only SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### 3. Install Node.js 20 LTS (via NodeSource apt repository)
Using the system package manager ensures Node.js is available to PM2's systemd startup service on reboot. nvm is user-scoped and not loaded in non-interactive systemd contexts, which causes PM2 autostart to silently fail after a reboot.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # should print v20.x.x
```

### 4. Install PM2 and pm2-logrotate
```bash
npm install -g pm2
pm2 install pm2-logrotate   # prevents log files filling the disk
```

### 5. Install Nginx and Certbot
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

### 6. Create app directories and configure server .env
```bash
sudo mkdir -p /var/www/keystimate/dist
sudo mkdir -p /var/www/keystimate/server
sudo chown -R deploy:deploy /var/www/keystimate

# Create server env file with ALL Group 2 variables
nano /var/www/keystimate/server/.env
# PORT=3000
# NODE_ENV=production
# CORS_ORIGIN=https://keystimate.com
# FIREBASE_PROJECT_ID=...
# FIREBASE_CLIENT_EMAIL=...
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 7. Configure Nginx

Create `/etc/nginx/sites-available/keystimate`:
```nginx
# Static SPA — keystimate.com
server {
    listen 80;
    server_name keystimate.com www.keystimate.com;
    root /var/www/keystimate/dist;
    index index.html;

    # React Router — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# API + WebSocket proxy — api.keystimate.com
server {
    listen 80;
    server_name api.keystimate.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Keep-alive for long-lived Socket.io connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/keystimate /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 8. Obtain SSL certificates
```bash
sudo certbot --nginx -d keystimate.com -d www.keystimate.com -d api.keystimate.com
```
Certbot auto-renews. Verify: `sudo certbot renew --dry-run`

### 9. Initial app deploy (first time)
```bash
# Upload built client and server files (run locally or via CI)
rsync -avz --delete client/dist/ deploy@<VPS_IP>:/var/www/keystimate/dist/
rsync -avz --delete --exclude='node_modules' server/ deploy@<VPS_IP>:/var/www/keystimate/server/

# On VPS: install dependencies and start
cd /var/www/keystimate/server
npm ci --omit=dev
pm2 start index.js --name keystimate-server
pm2 save
pm2 startup   # follow the printed command to enable autostart on reboot
```

### 10. Set up GitHub Actions deploy workflow
Add `.github/workflows/deploy.yml` to the repo (created during implementation phase).
Add all required secrets to GitHub repo Settings → Secrets and variables → Actions.

---

## Deployment Flow (ongoing)

```
git push origin main  →  GitHub Actions  →  live in ~60 seconds
```

### Rollback
The VPS has no git repository (deploys use rsync, not git clone). To roll back:

**Option 1 — Re-trigger a previous GitHub Actions run (recommended):**
1. Go to GitHub → Actions → find the last known good run
2. Click "Re-run jobs" to re-deploy that exact build to the VPS

**Option 2 — Manual re-deploy from local machine:**
```bash
# On your local machine, checkout the previous commit
git checkout <prev-sha>

# Build and rsync manually (same as CI/CD steps)
cd client && npm ci && npm run build
rsync -avz --delete client/dist/ deploy@<VPS_IP>:/var/www/keystimate/dist/
rsync -avz --delete --exclude='node_modules' server/ deploy@<VPS_IP>:/var/www/keystimate/server/

# SSH in and restart
ssh deploy@<VPS_IP>
cd /var/www/keystimate/server && npm ci --omit=dev && pm2 restart keystimate-server

# Return to main when done
git checkout main
```
> Always run `npm ci --omit=dev` after reverting — dependencies may have changed between commits.

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

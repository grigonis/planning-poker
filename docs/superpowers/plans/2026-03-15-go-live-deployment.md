# Go-Live Deployment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy keystimate.com to production — Netcup VPS with Nginx + PM2 + Certbot, Cloudflare domain + email routing, GitHub Actions CI/CD.

**Architecture:** Single Netcup VPS (Ubuntu 24.04) runs both the static SPA (Nginx) and the Node.js/Socket.io server (PM2). Cloudflare handles DNS and email forwarding. GitHub Actions auto-deploys on push to `main` by rsyncing built files and restarting PM2.

**Tech Stack:** Ubuntu 24.04, Nginx, Node.js 20 LTS (NodeSource), PM2, Certbot (Let's Encrypt), GitHub Actions, Cloudflare Registrar + Email Routing.

---

> **Note on plan structure:** This plan is mostly infrastructure/ops steps, not application code. The only code file created is `.github/workflows/deploy.yml`. Steps follow a configure → verify → commit pattern instead of TDD. Each manual step (Cloudflare dashboard, Netcup order) is clearly marked. All SSH commands are given in full and exact expected output is noted.

---

## File Structure

**Pre-written files (already in repo, just need to be committed):**
- `.github/workflows/deploy.yml` — GitHub Actions deploy workflow (already written to disk)

**No application code changes required.** The app is production-ready as-is.

---

## Chunk 1: Domain, DNS & Email (Cloudflare)

> **Manual steps** — done in the browser. No code changes.

### Task 1: Buy keystimate.com on Cloudflare Registrar

- [ ] **Step 1: Go to Cloudflare Registrar**
  Open `registrar.cloudflare.com` in your browser. Sign in or create a free Cloudflare account.

- [ ] **Step 2: Search for the domain**
  Search for `keystimate.com`. Confirm it is available and the price shown is ~$10.44/year.

- [ ] **Step 3: Purchase the domain**
  Complete the purchase. Cloudflare automatically sets itself as the DNS provider — no nameserver change needed.

- [ ] **Step 4: Verify DNS zone is active**
  Go to Cloudflare Dashboard → your account → you should see `keystimate.com` listed with status **Active**.

---

### Task 2: Add DNS records

> You don't have the VPS IP yet — come back to this task after Task 5 (VPS order). The records are documented here for reference.

- [ ] **Step 1: Navigate to DNS settings**
  Cloudflare Dashboard → `keystimate.com` → DNS → Records.

- [ ] **Step 2: Add apex A record**
  Click "Add record":
  - Type: `A`
  - Name: `@`
  - IPv4 address: `<VPS IP>` (from Netcup order confirmation)
  - Proxy status: **Proxied** (orange cloud) ✓
  - TTL: Auto

- [ ] **Step 3: Add api A record**
  Click "Add record":
  - Type: `A`
  - Name: `api`
  - IPv4 address: `<VPS IP>`
  - Proxy status: **DNS only** (grey cloud) ⚠️ — click the orange cloud to toggle it grey
  - TTL: Auto

  > **Why DNS only for api:** Cloudflare's proxy drops long-lived WebSocket connections. Socket.io requires a persistent connection. DNS only means traffic goes directly to your VPS where Nginx + Certbot handles TLS end-to-end.

- [ ] **Step 4: Add www CNAME**
  Click "Add record":
  - Type: `CNAME`
  - Name: `www`
  - Target: `keystimate.com`
  - Proxy status: Proxied (orange) ✓

- [ ] **Step 5: Verify records**
  All three records should now appear in the DNS table. Confirm `api` shows a grey cloud icon.

---

### Task 3: Set up Cloudflare Email Routing

- [ ] **Step 1: Enable Email Routing**
  Cloudflare Dashboard → `keystimate.com` → Email → Email Routing → click "Get started".

- [ ] **Step 2: Add forwarding rule**
  - Custom address: `help`
  - Destination: your personal email address (Gmail, Outlook, etc.)
  - Click Save.

- [ ] **Step 3: Verify destination address**
  Cloudflare will send a verification email to your personal inbox. Open it and click the verification link.

- [ ] **Step 4: Enable Email Routing**
  Back in the dashboard, click "Enable Email Routing". Cloudflare automatically adds the required MX and TXT DNS records.

- [ ] **Step 5: Smoke test (after DNS propagates — ~5 minutes)**
  Send a test email to `hello@keystimate.com` from any email client.
  Expected: email arrives in your personal inbox within a minute.

---

## Chunk 2: VPS Provisioning & Security

> **Manual + SSH steps.** You will need a terminal.

### Task 4: Order Netcup VPS 500 G12

- [ ] **Step 1: Go to Netcup**
  Open `netcup.eu` → Server → VPS → find **VPS 500 G12**.

- [ ] **Step 2: Configure and order**
  - Operating System: **Ubuntu 24.04 LTS**
  - Everything else: defaults
  - Complete the order and payment.

- [ ] **Step 3: Note the VPS IP address**
  After provisioning (usually 5–15 minutes), Netcup sends an email with:
  - VPS IP address (e.g. `185.x.x.x`)
  - Root password for initial login

  Write down the IP — you need it for Task 2 (DNS records).

- [ ] **Step 4: Go back and add DNS records**
  Now that you have the IP, complete Task 2 Steps 2–5.

---

### Task 5: Generate an SSH key pair (on your local machine)

> Skip if you already have an SSH key at `~/.ssh/id_ed25519.pub`.

- [ ] **Step 1: Generate the key pair**
  Open a terminal on your local Windows machine (Git Bash or WSL):
  ```bash
  ssh-keygen -t ed25519 -C "keystimate-deploy" -f ~/.ssh/id_ed25519
  ```
  Press Enter twice to use no passphrase (easier for CI/CD).

- [ ] **Step 2: Print your public key — copy it**
  ```bash
  cat ~/.ssh/id_ed25519.pub
  ```
  Expected output: a single line starting with `ssh-ed25519 AAAA...`
  Copy the entire line to your clipboard.

- [ ] **Step 3: Print your private key — keep it for Task 11**
  ```bash
  cat ~/.ssh/id_ed25519
  ```
  Copy the entire contents (including `-----BEGIN OPENSSH PRIVATE KEY-----` header/footer). You'll paste this into GitHub Secrets later.

---

### Task 6: Secure the VPS

- [ ] **Step 1: SSH in as root (initial login)**
  ```bash
  ssh root@<VPS_IP>
  ```
  Use the root password from the Netcup email. Accept the host fingerprint prompt by typing `yes`.

- [ ] **Step 2: Create the deploy user**
  ```bash
  adduser deploy
  ```
  Enter a strong password when prompted. Fill in name fields or press Enter to skip.
  ```bash
  usermod -aG sudo deploy
  ```

- [ ] **Step 3: Add your SSH public key to the deploy user**
  ```bash
  mkdir -p /home/deploy/.ssh
  echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> /home/deploy/.ssh/authorized_keys
  chmod 700 /home/deploy/.ssh
  chmod 600 /home/deploy/.ssh/authorized_keys
  chown -R deploy:deploy /home/deploy/.ssh
  ```
  Replace `PASTE_YOUR_PUBLIC_KEY_HERE` with the line you copied in Task 5 Step 2.

- [ ] **Step 4: Disable password auth and root login**
  ```bash
  nano /etc/ssh/sshd_config
  ```
  Find and change (or add) these two lines:
  ```
  PasswordAuthentication no
  PermitRootLogin no
  ```
  Save with `Ctrl+O`, `Enter`, `Ctrl+X`.
  ```bash
  systemctl restart sshd
  ```

- [ ] **Step 5: Configure UFW firewall**
  ```bash
  ufw allow 22
  ufw allow 80
  ufw allow 443
  ufw enable
  ```
  Type `y` when prompted to proceed.

- [ ] **Step 6: Verify SSH key login works (new terminal window)**
  Open a new terminal on your local machine — do NOT close the current root session yet.
  ```bash
  ssh deploy@<VPS_IP>
  ```
  Expected: logged in without a password prompt.
  If this fails, do NOT close the root session — debug from there first.

- [ ] **Step 7: Close the root session**
  Only after Step 6 succeeds:
  ```bash
  exit
  ```

---

## Chunk 3: VPS Software Stack

> All commands run as the `deploy` user unless noted with `sudo`.

### Task 7: Install Node.js 20 LTS

- [ ] **Step 1: SSH into VPS as deploy**
  ```bash
  ssh deploy@<VPS_IP>
  ```

- [ ] **Step 2: Install Node.js via NodeSource**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```

- [ ] **Step 3: Verify**
  ```bash
  node --version
  npm --version
  ```
  Expected: `v20.x.x` and `10.x.x` respectively.

---

### Task 8: Install PM2 and log rotation

- [ ] **Step 1: Install PM2 globally**
  ```bash
  sudo npm install -g pm2
  ```

- [ ] **Step 2: Install pm2-logrotate**
  ```bash
  pm2 install pm2-logrotate
  ```
  This prevents PM2 log files from filling the VPS disk over time.

- [ ] **Step 3: Verify**
  ```bash
  pm2 --version
  ```
  Expected: a version number like `5.x.x`.

---

### Task 9: Install Nginx and Certbot

- [ ] **Step 1: Install packages**
  ```bash
  sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
  ```

- [ ] **Step 2: Verify Nginx is running**
  ```bash
  sudo systemctl status nginx
  ```
  Expected: `active (running)`.

- [ ] **Step 3: Test Nginx responds (from local machine)**
  Open `http://<VPS_IP>` in your browser.
  Expected: default Nginx welcome page ("Welcome to nginx!").

---

## Chunk 4: App Directories & Server Environment

### Task 10: Create app directory structure and server .env

- [ ] **Step 1: Create directories**
  ```bash
  sudo mkdir -p /var/www/keystimate/dist
  sudo mkdir -p /var/www/keystimate/server
  sudo chown -R deploy:deploy /var/www/keystimate
  ```

- [ ] **Step 2: Verify ownership**
  ```bash
  ls -la /var/www/
  ```
  Expected: `keystimate` directory owned by `deploy deploy`.

- [ ] **Step 3: Create the server .env file**
  ```bash
  nano /var/www/keystimate/server/.env
  ```
  Paste and fill in your actual values:
  ```
  PORT=3000
  NODE_ENV=production
  CORS_ORIGIN=https://keystimate.com
  FIREBASE_PROJECT_ID=your-firebase-project-id
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
  ```
  Save with `Ctrl+O`, `Enter`, `Ctrl+X`.

  > **Where to find Firebase values:** Firebase Console → Project Settings → Service Accounts → Generate new private key. The downloaded JSON contains `project_id`, `client_email`, and `private_key`.

  > **FIREBASE_PRIVATE_KEY format:** Copy the entire `private_key` value from the JSON, including the `-----BEGIN/END PRIVATE KEY-----` lines. Wrap the whole thing in double quotes in the .env file. Replace literal `\n` sequences — they must stay as `\n` (not actual newlines) inside the double-quoted value.

- [ ] **Step 4: Verify .env is not world-readable**
  ```bash
  chmod 600 /var/www/keystimate/server/.env
  ls -la /var/www/keystimate/server/.env
  ```
  Expected: `-rw-------` permissions.

---

## Chunk 5: Nginx Configuration & SSL

### Task 11: Configure Nginx server blocks

- [ ] **Step 1: Create the Nginx config file**
  ```bash
  sudo nano /etc/nginx/sites-available/keystimate
  ```
  Paste the following exactly:
  ```nginx
  # Static SPA — keystimate.com
  server {
      listen 80;
      server_name keystimate.com www.keystimate.com;
      root /var/www/keystimate/dist;
      index index.html;

      # React Router — serve index.html for all client-side routes
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

          # Required for WebSocket / Socket.io upgrade
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";

          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;

          # Long timeout for persistent Socket.io connections
          proxy_read_timeout 86400s;
          proxy_send_timeout 86400s;
      }
  }
  ```
  Save with `Ctrl+O`, `Enter`, `Ctrl+X`.

- [ ] **Step 2: Enable the site**
  ```bash
  sudo ln -s /etc/nginx/sites-available/keystimate /etc/nginx/sites-enabled/
  ```

- [ ] **Step 3: Remove the default site to avoid conflicts**
  ```bash
  sudo rm /etc/nginx/sites-enabled/default
  ```

- [ ] **Step 4: Test and reload Nginx**
  ```bash
  sudo nginx -t
  ```
  Expected: `syntax is ok` and `test is successful`.
  ```bash
  sudo systemctl reload nginx
  ```

---

### Task 12: Obtain SSL certificates

> DNS records must be propagated before this step (usually within 5–10 minutes of adding them in Cloudflare). You can verify propagation with: `nslookup keystimate.com` — it should return your VPS IP.

- [ ] **Step 1: Confirm `api.keystimate.com` is DNS only in Cloudflare**
  Before running Certbot, go to Cloudflare Dashboard → `keystimate.com` → DNS → Records.
  Find the `api` A record and confirm its proxy status icon is **grey** (DNS only), not orange.
  If it is orange, click the orange cloud to toggle it grey and save.

  > **Why this matters:** Certbot uses an HTTP challenge to prove you own the domain. If `api` is proxied (orange), Cloudflare intercepts the challenge request and presents its own certificate — Certbot sees the wrong response and fails. DNS only means the challenge goes directly to your VPS.

- [ ] **Step 2: Run Certbot for all three domains**
  ```bash
  sudo certbot --nginx -d keystimate.com -d www.keystimate.com -d api.keystimate.com
  ```
  - When prompted: enter your email address (for renewal notices)
  - Agree to terms of service: `A`
  - Share email with EFF (optional): your choice
  - Certbot will automatically modify your Nginx config to add HTTPS blocks.

- [ ] **Step 3: Verify certificates were issued**
  Expected output ends with something like:
  ```
  Successfully received certificate.
  Certificate is saved at: /etc/letsencrypt/live/keystimate.com/fullchain.pem
  ```

- [ ] **Step 4: Test auto-renewal**
  ```bash
  sudo certbot renew --dry-run
  ```
  Expected: `Congratulations, all simulated renewals succeeded`.

- [ ] **Step 5: Verify HTTPS works (from local machine)**
  Open `https://keystimate.com` in your browser.
  Expected: a padlock icon and no certificate warning (even though the site is empty — dist/ is empty).

---

## Chunk 6: GitHub Actions Deploy Workflow

### Task 13: Commit the pre-written deploy workflow

> The file `.github/workflows/deploy.yml` is already written in the repository. This task just commits it.

**Files:**
- `.github/workflows/deploy.yml` — already exists, needs to be committed

- [ ] **Step 1: Verify the workflow file exists**
  ```bash
  cat .github/workflows/deploy.yml
  ```
  Expected: the YAML file contents print to the terminal. If you see "No such file", something went wrong — contact support.

- [ ] **Step 2: Verify `client/package-lock.json` is committed**
  ```bash
  git status client/package-lock.json
  ```
  Expected: either nothing (file is already tracked and clean) or the file appears in the output. If it shows as untracked, run:
  ```bash
  git add client/package-lock.json
  ```
  The workflow uses this file for npm cache — it must be committed.

- [ ] **Step 3: Verify the workflow is already committed**
  ```bash
  git log --oneline .github/workflows/deploy.yml
  ```
  Expected: one commit line like `a3b5372 ci: add deploy workflow + go-live implementation plan`.
  The file was pre-committed — nothing to do here.

---

### Task 14: Add GitHub Actions secrets

> Done in the GitHub web UI — Settings → Secrets and variables → Actions → New repository secret.

- [ ] **Step 1: Open GitHub secrets page**
  Go to your repo on GitHub → Settings → Secrets and variables → Actions → click "New repository secret" for each secret below.

- [ ] **Step 2: Add infrastructure secrets**
  | Secret name | Value |
  |---|---|
  | `VPS_HOST` | Your VPS IP address |
  | `VPS_USER` | `deploy` |
  | `VPS_SSH_KEY` | Contents of `~/.ssh/id_ed25519` (the private key, full file including header/footer) |

- [ ] **Step 3: Add build-time (VITE_*) secrets**
  | Secret name | Value |
  |---|---|
  | `VITE_FIREBASE_API_KEY` | From your Firebase project settings |
  | `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `keystimate.firebaseapp.com` |
  | `VITE_FIREBASE_PROJECT_ID` | e.g. `keystimate` |
  | `VITE_SERVER_URL` | `https://api.keystimate.com` |
  | `VITE_FIREBASE_EMAIL_LINK_URL` | `https://keystimate.com` |

  > **Where to find Firebase values:** Firebase Console → Project Settings → General → Your apps → SDK setup and configuration.

- [ ] **Step 4: Verify all 8 secrets are listed**
  The Secrets page should show all 8 secrets (values are hidden, just names visible).

---

## Chunk 7: Initial Deploy & PM2 Setup

### Task 15: First manual deploy (before CI/CD is active)

> Before pushing to trigger GitHub Actions, we do a manual first deploy to start PM2 for the first time.

- [ ] **Step 1: Build the client locally**
  On your local machine, in the repo root. You need a local `.env` for the build:
  ```bash
  cd client
  ```
  Create `client/.env` temporarily with your production values:
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_SERVER_URL=https://api.keystimate.com
  VITE_FIREBASE_EMAIL_LINK_URL=https://keystimate.com
  ```
  Then build:
  ```bash
  npm ci && npm run build
  cd ..
  ```

- [ ] **Step 2: Rsync the client dist to VPS**
  ```bash
  rsync -avz --delete \
    client/dist/ \
    deploy@<VPS_IP>:/var/www/keystimate/dist/
  ```
  Expected: files uploaded, output shows transferred file names.

- [ ] **Step 3: Rsync the server files to VPS**
  ```bash
  rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.env' \
    server/ \
    deploy@<VPS_IP>:/var/www/keystimate/server/
  ```

- [ ] **Step 4: SSH into VPS and install server dependencies**
  ```bash
  ssh deploy@<VPS_IP>
  cd /var/www/keystimate/server
  npm ci --omit=dev
  ```
  Expected: packages installed, no errors.

- [ ] **Step 5: Start the server with PM2**
  ```bash
  pm2 start index.js --name keystimate-server
  ```
  Expected output includes `keystimate-server` with status `online`.

- [ ] **Step 6: Verify the server is running**
  ```bash
  pm2 status
  ```
  Expected: `keystimate-server` shows `online`, 0 restarts.
  ```bash
  pm2 logs keystimate-server --lines 20
  ```
  Expected: `Server running on port 3000` — no errors.

- [ ] **Step 7: Enable PM2 autostart on reboot**
  ```bash
  pm2 startup
  ```
  This prints a command. **Copy and run that exact command.** It looks like:
  ```
  sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
  ```
  Run the printed command now (it starts with `sudo env ...`).

- [ ] **Step 8: Save the PM2 process list**
  **Only after running the printed sudo command from Step 7:**
  ```bash
  pm2 save
  ```
  This saves the process list to the path that the systemd unit created in Step 7 will read on reboot.

  > **Order matters:** `pm2 startup` installs the systemd service first, then `pm2 save` writes the process list to the path that service expects. Reversing this order can result in the server not auto-starting after a reboot.

- [ ] **Step 9: Delete the temporary local client .env**
  Back on your local machine — the `.env` file used for the manual build should not be committed:
  ```bash
  rm client/.env
  ```
  Verify it is not tracked:
  ```bash
  git status
  ```
  Expected: `client/.env` does not appear (it should already be in `.gitignore`).

---

## Chunk 8: Smoke Tests & First Auto-Deploy

### Task 16: Smoke test the live site

- [ ] **Step 1: Test the health endpoint**
  From your local machine or browser:
  ```bash
  curl https://api.keystimate.com/health
  ```
  Expected: `{"status":"ok","uptime":...}`

- [ ] **Step 2: Test the frontend loads**
  Open `https://keystimate.com` in your browser.
  Expected: the Keystimate landing page loads with no console errors.

- [ ] **Step 3: Test www redirect**
  Open `https://www.keystimate.com`.
  Expected: same landing page (Cloudflare handles the CNAME).

- [ ] **Step 4: Test React Router — deep link**
  Navigate directly to `https://keystimate.com/create` in the browser (type it in the address bar, don't click a link).
  Expected: the Create Room page loads — not a 404.

- [ ] **Step 5: Test Socket.io connection**
  Open `https://keystimate.com` and open browser DevTools → Network → filter by "WS".
  Create a room and join it.
  Expected: a WebSocket connection to `wss://api.keystimate.com` is established (status 101).

- [ ] **Step 6: Test full room flow end-to-end**
  - Create a room
  - Open a second browser window (or incognito) and join the same room
  - Cast votes in both windows
  - Reveal votes
  Expected: both windows stay in sync in real time.

---

### Task 17: Trigger first auto-deploy via GitHub Actions

- [ ] **Step 1: Push the workflow file to main**
  ```bash
  git push origin main
  ```

- [ ] **Step 2: Watch the Actions run**
  Go to GitHub → Actions tab.
  Expected: a new workflow run appears named "Deploy to Production".

- [ ] **Step 3: Verify all steps pass**
  Click into the run and confirm all steps are green. Total time should be ~45–90 seconds.

- [ ] **Step 4: Confirm the site still works after auto-deploy**
  Repeat Task 16 Steps 1–2.

- [ ] **Step 5: Verify PM2 is still online after deploy restart**
  ```bash
  ssh deploy@<VPS_IP>
  pm2 status
  ```
  Expected: `keystimate-server` shows `online`.

---

### Task 18: Test VPS reboot survival

- [ ] **Step 1: Reboot the VPS**
  ```bash
  ssh deploy@<VPS_IP>
  sudo reboot
  ```

- [ ] **Step 2: Wait ~60 seconds then verify**
  ```bash
  ssh deploy@<VPS_IP>
  pm2 status
  ```
  Expected: `keystimate-server` is `online` automatically — no manual restart needed.

- [ ] **Step 3: Test the health endpoint again**
  ```bash
  curl https://api.keystimate.com/health
  ```
  Expected: `{"status":"ok",...}`

---

## Chunk 9: Ongoing Operations Reference

> Not implementation steps — reference for after go-live.

### Deploying new features
```bash
git push origin main
# GitHub Actions handles the rest — live in ~60 seconds
```

### Viewing live server logs
```bash
ssh deploy@<VPS_IP>
pm2 logs keystimate-server --lines 50
```

### Rollback to a previous deploy
**Option 1 (recommended):** GitHub → Actions → find a previous successful run → Re-run jobs.

  > **Caveat:** Re-running an old job restores the old client `dist/` but the server files on the VPS were already overwritten by the failed deploy. If the server code changed between commits, use Option 2 instead to fully restore both client and server.

**Option 2 (manual):**
```bash
git checkout <prev-sha>
cd client && npm ci && npm run build && cd ..
rsync -avz --delete client/dist/ deploy@<VPS_IP>:/var/www/keystimate/dist/
rsync -avz --delete --exclude='node_modules' --exclude='.env' server/ deploy@<VPS_IP>:/var/www/keystimate/server/
ssh deploy@<VPS_IP> "cd /var/www/keystimate/server && npm ci --omit=dev && pm2 restart keystimate-server"
git checkout main
```

### Renewing SSL (automatic)
Certbot auto-renews. To manually verify:
```bash
sudo certbot renew --dry-run
```

### Checking disk usage (pm2-logrotate handles logs, but good to know)
```bash
df -h
du -sh ~/.pm2/logs/
```

### Adding email send capability in future
When you need to send from `help@keystimate.com` (not just receive):
1. Sign up for Zoho Mail free tier or Google Workspace
2. Add their MX + SPF + DKIM DNS records in Cloudflare
3. No VPS changes needed

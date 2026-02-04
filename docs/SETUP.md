# TradeMatch – setup guide

Follow these steps to get the app running locally. If you plan to deploy the API (e.g. Vercel), do **step 0** first so the repo is on GitHub.

---

## 0. Set up GitHub (do this first if you want to deploy the API)

1. **Create a repo on GitHub**
   - Go to [github.com](https://github.com) and sign in.
   - Click **+** → **New repository**.
   - Name it (e.g. `tradematch`), choose **Private** or **Public**, and **do not** tick “Add a README” or “Add .gitignore” (you already have a local repo).
   - Click **Create repository**.

2. **Connect your local repo and push**
   - In Terminal, from the **project root** (`tradematch`), run (replace `YOUR_USERNAME` and `tradematch` with your GitHub username and repo name):
     ```bash
     git remote add origin https://github.com/YOUR_USERNAME/tradematch.git
     git branch -M main
     git add .
     git commit -m "Initial commit: Next.js API, Expo app, Supabase, onboarding"
     git push -u origin main
     ```
   - If you already made a first commit, skip `git add` and `git commit` and just run `git remote add origin ...`, then `git push -u origin main`.

Your code is now on GitHub. You can use this repo when deploying the API (e.g. Vercel “Import from GitHub”) or for backups and collaboration.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Pick an organization (or create one), name the project (e.g. `tradematch`), set a database password and region, then click **Create new project**.
4. Wait for the project to finish provisioning.

---

## 2. Run the database migration

1. In the Supabase dashboard, open your project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Open the file `supabase/migrations/001_profiles.sql` in this repo and copy its full contents.
5. Paste into the SQL Editor and click **Run** (or press Cmd/Ctrl+Enter).
6. You should see “Success. No rows returned.” That creates the `profiles` table and the trigger that creates a profile when a user signs up.

7. Run the second migration (onboarding fields): open `supabase/migrations/002_contractor_onboarding.sql`, copy its contents, paste into a new SQL Editor query, and click **Run**. That adds `business_type`, `employee_count`, and `is_employer` to `profiles`.

---

## 3. Get your Supabase keys

1. In the Supabase dashboard, go to **Project settings** (gear icon in the left sidebar).
2. Open **API**.
3. Copy:
   - **Project URL** → you’ll use this as `NEXT_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_URL`.
   - **anon public** (under “Project API keys”) → you’ll use this as `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - **service_role** (under “Project API keys”) → you’ll use this as `SUPABASE_SERVICE_ROLE_KEY` for the backend only (do **not** put this in the mobile app).

---

## 4. Backend env (Next.js API)

1. In the **project root** (where `package.json` and `next.config.js` are), copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and set at least these (use the values from step 3):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
   Leave the other variables empty for now; they’re for Stripe, email, SMS later.

---

## 5. Mobile env (Expo app)

1. Go into the mobile app folder:
   ```bash
   cd mobile
   ```
2. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
3. Open `mobile/.env` and set (again using the values from step 3):
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3000
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```
   Use your **actual** Project URL and anon key. Do **not** put the service_role key here.

4. Go back to the project root:
   ```bash
   cd ..
   ```

---

## 6. Install dependencies (if you haven’t already)

The project has **no workspaces**: the backend and mobile app each have their own `node_modules`. Install both:

From the **project root**:
```bash
npm install
```

Then from the **mobile** folder:
```bash
cd mobile && npm install && cd ..
```

(If you ever delete `node_modules` or clone the repo fresh, run both of these again.)

---

## 6b. Deploy the API so the phone doesn’t need your laptop (optional)

If you want the app to work from your phone **without running the Next.js backend on your laptop**, deploy the API to the cloud. Then the phone and Expo talk to the deployed API; you only run Metro (Expo) on your laptop to serve the app bundle.

**Option: Vercel (good fit for Next.js, free tier)**

1. Push your repo to GitHub (if you haven’t already).
2. Go to [vercel.com](https://vercel.com), sign in, and click **Add New → Project**. Import your GitHub repo (e.g. `tradematch`).
3. Leave **Framework Preset** as Next.js. Under **Environment Variables**, add the same ones your backend needs (at least):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key  
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key  
   (You can add Stripe, Resend, etc. later.)
4. Click **Deploy**. When it’s done, Vercel gives you a URL like `https://tradematch-xxxx.vercel.app`.
5. In **`mobile/.env`** set the API URL to that deployed URL (use `https://`, not `http://`):
   ```
   EXPO_PUBLIC_API_URL=https://tradematch-xxxx.vercel.app
   ```
   Replace with your real Vercel URL.
6. Restart Expo so it picks up the new env:
   ```bash
   cd mobile && npx expo start --clear
   ```
7. You do **not** need to run `npm run dev` on your laptop. The phone will call the API on Vercel. You still run `npx expo start` so the phone can load the app (Metro serves the JS bundle).

**Check:** Open `https://your-vercel-url.vercel.app/api/health` in a browser — you should see `{"status":"ok","service":"tradematch-api"}`.

Other hosts (Railway, Render, Fly.io) work too: build command `npm run build`, start command `npm start`, and add the same env vars. Then set `EXPO_PUBLIC_API_URL` in `mobile/.env` to that deployed URL.

---

## 7. Start the backend (skip if you deployed in 6b)

From the **project root**:

```bash
npm run dev
```

Leave this running. The API will be at **http://localhost:3000**. You can check it with:  
http://localhost:3000/api/health — you should see `{"status":"ok","service":"tradematch-api"}`.

If you deployed the API in step 6b, you don’t need to run this; the app uses the deployed URL instead.

---

## 8. Start the mobile app

Open a **second terminal**, and from the **project root** run:

```bash
npm run dev:mobile
```

Or:

```bash
cd mobile && npx expo start
```

- Press **i** for iOS simulator or **a** for Android emulator, or scan the QR code with Expo Go on your phone (same Wi‑Fi as your machine).
- The app should load: you’ll see the login screen if you’re not signed in, or the home screen if you are.

---

## 9. Test sign up and sign in

1. In the app, tap **Sign up** (or open the signup screen).
2. Enter an email and password (at least 6 characters) and tap **Sign up**.
3. If Supabase email confirmation is enabled, check your email and confirm; otherwise you may be signed in straight away.
4. You should land on the home screen with “You’re signed in…” and a **Sign out** button.
5. Tap **Sign out** — you should be taken back to the login screen.
6. Sign in again with the same email and password to confirm login works.

---

## Troubleshooting

### "Network request failed" when tapping onboarding or loading profile

The app calls your Next.js API at `EXPO_PUBLIC_API_URL`. This usually fails when:

1. **Backend not running** – Start it from the project root: `npm run dev`. Leave it running while you use the app.
2. **Testing on a physical device (Expo Go on your phone)** – The phone cannot reach `http://localhost:3000` because “localhost” is the phone itself. Use your computer’s **LAN IP** and the same port as the backend:
   - Find your Mac’s IP: **System Settings → Network → Wi‑Fi → Details** (or run `ipconfig getifaddr en0` in Terminal).
   - In `mobile/.env` set:
     ```
     EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
     ```
     e.g. `http://192.168.0.150:3000`. Phone and Mac must be on the same Wi‑Fi.
   - Restart Expo (`npx expo start` or `npx expo start --clear`) so it picks up the new env.
3. **Wrong port** – If Next.js said it’s using 3001 (or another port), use that port in `EXPO_PUBLIC_API_URL`.

### "Port 3000 is in use" / Next runs on 3001

If you see `Port 3000 is in use, trying 3001 instead`, the API is on **port 3001**. Either:

- **Option A:** In `mobile/.env`, set `EXPO_PUBLIC_API_URL=http://localhost:3001` so the app talks to the correct port.
- **Option B:** Free port 3000: find what’s using it (e.g. another Next app or Expo) and stop it, then run `npm run dev` again so it uses 3000.

### "EMFILE: too many open files" (Watchpack / file watcher)

This is a macOS limit on open file descriptors. The dev server may still say "Ready" but hot reload can be flaky. To fix:

1. Check the limit: `ulimit -n` (often 256).
2. Raise it for the current terminal session before running `npm run dev`:
   ```bash
   ulimit -n 10240
   npm run dev
   ```
3. To make a higher limit the default for your user (optional), add to `~/.zshrc` or `~/.bash_profile`:
   ```bash
   ulimit -n 10240
   ```
   Then open a new terminal and run `npm run dev` from the project root.

---

## Summary checklist

- [ ] Supabase project created  
- [ ] `001_profiles.sql` and `002_contractor_onboarding.sql` run in SQL Editor  
- [ ] Root `.env.local` has `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`  
- [ ] `mobile/.env` has `EXPO_PUBLIC_SUPABASE_*` and `EXPO_PUBLIC_API_URL`  
- [ ] Dependencies: `npm install` (root) and `cd mobile && npm install`  
- [ ] **Either:** Backend running locally (`npm run dev`) **or** API deployed (e.g. Vercel) and `EXPO_PUBLIC_API_URL` set to the deployed URL  
- [ ] Mobile: `npm run dev:mobile` or `cd mobile && npx expo start`  
- [ ] Sign up and sign in work in the app  

If something fails, check: env vars match the Supabase **API** page (URL and anon key), no typos in `.env`/`.env.local`, and (if local) both backend and mobile are running when you test.

# Private Status — Two-User Shared Status App

A production-quality, private, mobile-first two-user shared status web application designed for iPhone and deployed on Vercel at $0/month.

---

## Features

- **Private Two-User App**: Strictly 2 accounts ("User 1" and "User 2"). No unauthorized registrations.
- **My Status vs Other User's Status**: Real-time / near-real-time synchronization (5-second polling).
- **Availability-first status controls**: Each person chooses between Available and Not available as their primary state.
- **Intent statuses**: Hit me, The mood, and Fancy a fag communicate what kind of contact is wanted.
- **Status Change History**: Lightweight audit trail recording timestamp, previous status, and new status for each change.
- **iPhone Optimized & Safe-Area Aware**: Min 48–64px touch targets, light Apple-inspired theme, `env(safe-area-inset-*)` support.
- **PWA (Progressive Web App)**: Installable directly to iOS Home Screen via Safari "Add to Home Screen" with standalone mode and custom icons.
- **Apple Shortcuts Compatibility**: Simple URL structure (`/dashboard`) with quick-action parameter support (`/dashboard?set=hit_me_up`).
- **Free-Tier Architecture ($0/month)**: Next.js 16 + Turso (free SQLite at the edge) + NextAuth v5 JWT sessions + Vercel Hobby plan.

---

## Technology Stack

- **Framework**: Next.js (App Router, Server Components & Client Actions)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite via Turso (`@libsql/client` + Drizzle ORM)
- **Authentication**: NextAuth.js v5 (Auth.js) with secure Credentials provider & bcrypt
- **PWA**: Web App Manifest + Service Worker

---

## Local Setup & Development

### 1. Prerequisites
- Node.js 20+
- npm (included with Node.js)

### 2. Installation
Clone the repository and install dependencies:
```bash
cd status-app
npm install
```

### 3. Create Database (Turso Free Tier)
1. Sign up for free at [turso.tech](https://turso.tech).
2. Install the Turso CLI (optional) or create a database from the Turso web dashboard:
   ```bash
   turso db create status-db
   turso db show status-db --url
   turso db tokens create status-db
   ```
   *(Alternatively for local offline testing, you can use `file:local.db` without needing an internet connection).*

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the values:
```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://status-db-yourusername.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# NextAuth (Generate a secret with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-32-character-secret-here
NEXTAUTH_URL=http://localhost:3000

# User 1 Account
USER1_USERNAME=user1
USER1_PASSWORD=your_secure_password_for_user_1
USER1_DISPLAY_NAME=Alice

# User 2 Account
USER2_USERNAME=user2
USER2_PASSWORD=your_secure_password_for_user_2
USER2_DISPLAY_NAME=Bob
```

### 5. Seed Database & Create Accounts
Run the seed script to create tables and provision the 2 user accounts with bcrypt-hashed passwords:
```bash
npm run db:seed
```

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser or iPhone simulator.

---

## Testing

### Run Integration Tests
An automated test suite (`scripts/test-api-flow.mjs`) verifies the entire authentication flow, permissions, status updates, cross-user visibility, and invalid inputs:
```bash
# In one terminal, ensure the server is running (e.g. npm run start or npm run dev)
node scripts/test-api-flow.mjs
```

### Run Production Build
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

---

## Vercel Deployment Guide

Deploying to Vercel takes under 3 minutes and runs entirely on the **Free Hobby Tier** ($0/month):

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Initial commit: private two-user status app"
   git push origin main
   ```

2. **Import Project in Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New** → **Project**.
   - Select your repository and click **Import**.

3. **Configure Environment Variables in Vercel**:
   Under the **Environment Variables** section in the Vercel project settings, add:
   | Variable | Value | Notes |
   |---|---|---|
   | `TURSO_DATABASE_URL` | `libsql://status-db-...turso.io` | From Turso dashboard |
   | `TURSO_AUTH_TOKEN` | `eyJhbGciOi...` | From Turso dashboard |
   | `NEXTAUTH_SECRET` | `(generated 32+ char secret)` | Run `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://your-project.vercel.app` | Your Vercel production URL |
   | `USER1_USERNAME` | `user1` | Used during seed |
   | `USER1_PASSWORD` | `your-password-1` | Used during seed |
   | `USER1_DISPLAY_NAME` | `User 1` | Used during seed |
   | `USER2_USERNAME` | `user2` | Used during seed |
   | `USER2_PASSWORD` | `your-password-2` | Used during seed |
   | `USER2_DISPLAY_NAME` | `User 2` | Used during seed |

4. **Deploy**:
   - Click **Deploy**. Vercel will build and deploy the application.

5. **Run the Database Seed (Once)**:
   You can run the seed script locally pointing to your production Turso database:
   ```bash
   TURSO_DATABASE_URL="libsql://status-db-...turso.io" \
   TURSO_AUTH_TOKEN="your_token" \
   USER1_USERNAME="user1" \
   USER1_PASSWORD="your-password-1" \
   USER1_DISPLAY_NAME="User 1" \
   USER2_USERNAME="user2" \
   USER2_PASSWORD="your-password-2" \
   USER2_DISPLAY_NAME="User 2" \
   npm run db:seed
   ```

---

## iPhone Setup & PWA Installation

To install as a native-feeling iPhone utility app:

1. Open **Safari** on iPhone.
2. Navigate to your deployed application (e.g. `https://your-project.vercel.app/login`).
3. Log in with your respective account (check "Remember Me").
4. Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
5. Scroll down and tap **Add to Home Screen**.
6. Name it **"Status"** and tap **Add**.
7. An icon labeled "Status" with the fire flame icon will appear on your Home Screen.
8. Tapping it opens the app in **standalone full-screen mode** with no Safari URL bar or navigation buttons.

---

## Apple Shortcuts Integration

You can integrate Private Status directly into iOS Shortcuts and Siri:

### Shortcut 1: "Open Status"
- Open the **Shortcuts** app on iPhone.
- Tap **+** to create a new shortcut.
- Add action: **Safari** → **Open URL**.
- Set URL to: `https://your-project.vercel.app/dashboard`.
- Rename shortcut to **"Status"**.
- Add to Siri: You can now say *"Hey Siri, Status"* to jump right in.

### Shortcut 2: One-Tap "Hit Me Up" Action
- Create a new shortcut named **"Hit Me Up"**.
- Add action: **Safari** → **Open URL**.
- Set URL to: `https://your-project.vercel.app/dashboard?set=hit_me_up`.
- When opened, the app immediately updates your status to **"HIT ME UP IMMEDIATELY"** without requiring any further taps!

### Shortcut 3: One-Tap "Available" Action
- URL: `https://your-project.vercel.app/dashboard?set=available`.

---

## Security & Architecture Details

- **Server-Side Authorization**: The `/api/status` PUT route enforces that only the logged-in session user's record can be mutated (`session.user.id`).
- **No Client Secrets**: Database credentials and tokens remain strictly on the server (`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are never prefixed with `NEXT_PUBLIC_`).
- **Protected Routes**: Middleware redirects any unauthenticated requests to `/dashboard` directly to `/login`.
- **Lightweight Status History**: Every status transition inserts a record into the `statusHistory` table with `id`, `user_id`, `previous_status`, `new_status`, and `changed_at` (ISO timestamp).

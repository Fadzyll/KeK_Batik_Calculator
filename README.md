# 🍫 Kek Batik Manager

A small sales management system for kek batik:

- **Ingredients**: record each ingredient's pack price and size (e.g. Milo 1kg = RM32.90).
- **Recipes & Pricing**: say how much of each ingredient one 8×8″ loyang uses, add extra costs
  (packaging, gas, labour), and get a **suggested price per piece** for every way of cutting it
  (3×3 = 9 pcs, 4×4 = 16 pcs, 5×5 = 25 pcs…), based on your target profit margin and rounding.
- **Expenses**: log every purchase. You can optionally update the ingredient's price to what you just paid.
- **Sales**: log sales (price auto-fills from your recipe), filtered by month.
- **Dashboard**: this month's sales, expenses and profit, plus a 6-month view and best sellers.
- **Login required**: data is private to your account (Supabase Auth + Row Level Security).

Built with Next.js 15 (App Router), Tailwind CSS 4 and Supabase.

## How the price is calculated

```
ingredient cost / loyang = Σ (amount used ÷ pack size × pack price)
cost / piece             = (ingredient cost + per-loyang extras) ÷ pieces + per-piece extras
suggested price          = cost / piece ÷ (1 − margin%)   → rounded UP to your step (e.g. RM0.50)
```

Example: ingredients RM11 + gas RM5 per loyang, plastic RM0.10 per piece, cut 4×4 (16 pcs), 50% margin:
cost/piece = 16 ÷ 16 + 0.10 = RM1.10 → RM2.20 → rounded to **RM2.50**.

> Note: the "amount used" in a recipe must be in the **same unit** as the ingredient's pack
> (if the pack is 1000 g, enter grams used, e.g. 250).

---

## Setup

### 1. Supabase (database + login)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. Create your login: **Authentication → Users → Add user → Create new user** (enter your email and a password,
   and tick *Auto Confirm User*).
4. Recommended: **Authentication → Sign In / Providers → Email** → turn **off** "Allow new users to sign up",
   so nobody else can create an account. (The app has no sign-up page anyway.)
5. Copy your keys from **Project Settings → API Keys**: the *Project URL* (`https://<project-id>.supabase.co`) and the
   **Publishable key** (`sb_publishable_...`; on older projects this is the *anon public* key).
   Put the publishable key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Never** use the `sb_secret_...` key in this app.

### 2. Run locally (optional)

```bash
cp .env.example .env.local   # then paste your Supabase URL and anon key
npm install
npm run dev                  # open http://localhost:3000
```

### 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub repository.
2. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy**. Every push to your main branch will redeploy automatically.

## Development

```bash
npm test        # unit tests for the pricing maths (lib/pricing.ts)
npm run build   # production build
```

### Project structure

```
app/
  page.tsx               Dashboard
  ingredients/           Ingredient list + actions
  recipes/               Recipe list, recipe detail + pricing calculator
  expenses/              Expense log
  sales/                 Sales log
  login/                 Sign in
lib/
  pricing.ts             Pure pricing maths (tested)
  supabase/              Supabase clients (server, middleware)
supabase/schema.sql      Database tables + Row Level Security
```

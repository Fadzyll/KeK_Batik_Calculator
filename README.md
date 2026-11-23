# 🍫 Kek Batik Manager

A small sales management system for kek batik:

- **Ingredients**: record each ingredient's pack price and size (e.g. Milo 1kg = RM32.90).
- **Recipes & Pricing**: say how much of each ingredient one 8×8″ loyang uses, add extra costs
  (packaging, gas, labour), and get a **suggested price per piece** for any cut: rows × columns
  (4×2 = 8 pcs, 4×4 = 16 pcs, 5×4 = 20 pcs…), based on your target profit margin and rounding.
  Each cut has an ⓘ button that shows a picture of how to slice the loyang.
- **Expenses**: log every purchase. You can optionally update the ingredient's price to what you just paid.
- **Sales**: log sales (price auto-fills from your recipe), filtered by month.
- **Dashboard**: this month's sales, expenses and profit, plus a 6-month view and best sellers.
- **Register + email verification**: anyone can register, but must click the link in a verification email
  before they can sign in. Each account only ever sees its own data (Supabase Auth + Row Level Security).

Built with Next.js 15 (App Router), Tailwind CSS 4 and Supabase.

## How the price is calculated

```
ingredient cost / loyang = Σ (amount used ÷ pack size × pack price)
pieces                   = rows × columns
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
   Then do the same for each file in [`supabase/migrations/`](supabase/migrations) in number order
   (they're safe to run more than once).
3. **Authentication → Sign In / Providers → Email**: make sure **Allow new users to sign up** and
   **Confirm email** are both **on**.
4. **Authentication → URL Configuration**:
   - **Site URL**: `https://kek-batik-calculator.vercel.app` (your Vercel URL)
   - **Redirect URLs**: add `https://kek-batik-calculator.vercel.app/**` (and `http://localhost:3000/**` for local dev)

   Without this, the link in the verification email points to `localhost` and won't work.
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

> The server region is pinned to **Sydney (`syd1`)** in `vercel.json` to sit next to the Supabase
> database (ap-southeast-2). If you ever move Supabase to another region, change it there too;
> a server far from the database makes every page slow.

### Verification emails

Supabase's built-in email sender only allows a few emails per hour and is meant for testing.
If many people will register, connect your own SMTP (e.g. Resend, Brevo, Gmail SMTP) under
**Authentication → Emails → SMTP Settings**. You can also change the email wording under
**Authentication → Emails → Templates → Confirm signup**.

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

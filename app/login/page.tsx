import { login } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-6 text-center">
        <div className="text-5xl">🍫</div>
        <h1 className="h1 mt-2">Kek Batik Manager</h1>
        <p className="muted">Sign in to manage your costs and sales</p>
      </div>
      <form action={login} className="card space-y-4">
        <FormError message={error} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        <SubmitButton className="btn w-full" pendingText="Signing in…">Sign in</SubmitButton>
      </form>
      <p className="mt-4 text-center text-xs text-cocoa-500">
        Accounts are created in the Supabase dashboard (Authentication → Users).
      </p>
    </div>
  );
}

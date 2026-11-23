import Link from "next/link";
import { login, resendConfirmation } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { FormMessage } from "@/components/FormMessage";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; unconfirmed?: string }>;
}) {
  const { error, message, unconfirmed } = await searchParams;
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-6 text-center">
        <div className="text-5xl">🍫</div>
        <h1 className="h1 mt-2">Kek Batik Manager</h1>
        <p className="muted">Sign in to manage your costs and sales</p>
      </div>

      {unconfirmed && (
        <form action={resendConfirmation} className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="mb-2">
            Please verify your email first. Check the inbox (and spam folder) for <b>{unconfirmed}</b>.
          </p>
          <input type="hidden" name="email" value={unconfirmed} />
          <SubmitButton className="btn-ghost border border-amber-300 text-amber-900" pendingText="Sending…">
            Resend verification email
          </SubmitButton>
        </form>
      )}

      <form action={login} className="card space-y-4">
        <FormError message={error} />
        <FormMessage message={message} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" defaultValue={unconfirmed} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        <SubmitButton className="btn w-full" pendingText="Signing in…">Sign in</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-cocoa-600">
        No account yet?{" "}
        <Link href="/register" className="font-semibold text-cocoa-800 underline">Register</Link>
      </p>
    </div>
  );
}

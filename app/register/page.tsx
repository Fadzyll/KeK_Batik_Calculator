import Link from "next/link";
import { register } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { PasswordInput } from "@/components/PasswordInput";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  if (sent) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <div className="text-5xl">📧</div>
        <h1 className="h1 mt-2">Check your email</h1>
        <div className="card mt-6 space-y-3 text-left text-sm text-cocoa-800">
          <p>
            We sent a verification link to <b>{sent}</b>.
          </p>
          <p>Click the link in that email to activate your account. After that you can sign in as usual.</p>
          <p className="text-cocoa-500">Can&apos;t find it? Check your spam or promotions folder. It can take a few minutes to arrive.</p>
        </div>
        <Link href="/login" className="btn mt-6">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="mb-6 text-center">
        <div className="text-5xl">🍫</div>
        <h1 className="h1 mt-2">Create an account</h1>
        <p className="muted">We&apos;ll email you a link to verify your account</p>
      </div>
      <form action={register} className="card space-y-4">
        <FormError message={error} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password (min. 8 characters)</label>
          <PasswordInput id="password" name="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <PasswordInput id="confirm" name="confirm" required minLength={8} autoComplete="new-password" />
        </div>
        <SubmitButton className="btn w-full" pendingText="Creating account…">Register</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-cocoa-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-cocoa-800 underline">Sign in</Link>
      </p>
    </div>
  );
}

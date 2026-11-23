import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// The link in the verification email lands here.
// Supports both Supabase link styles: ?code=… (default) and ?token_hash=…&type=… (custom template).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}/`);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("This verification link is invalid or has expired. Sign in to get a new one.")}`,
    );
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
    // Supabase has already verified the email before redirecting here. Exchanging the code
    // only fails if the link was opened in a different browser/device, so just ask them to sign in.
    return NextResponse.redirect(
      `${origin}/login?message=${encodeURIComponent("Your email is verified! Please sign in.")}`,
    );
  }

  const errDesc = searchParams.get("error_description");
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(errDesc ?? "Invalid verification link.")}`,
  );
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site-url";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    if (error.code === "email_not_confirmed") {
      redirect(`/login?unconfirmed=${encodeURIComponent(email)}`);
    }
    const msg = error.code === "invalid_credentials" ? "Wrong email or password." : error.message;
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
  redirect("/");
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=" + encodeURIComponent("Enter your email."));
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${await siteUrl()}/auth/confirm` },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect(`/login?message=${encodeURIComponent(`We sent a new verification link to ${email}.`)}`);
}

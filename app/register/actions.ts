"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site-url";

function fail(msg: string): never {
  redirect(`/register?error=${encodeURIComponent(msg)}`);
}

export async function register(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email) fail("Please enter your email.");
  if (password.length < 8) fail("Password must be at least 8 characters.");
  if (password !== confirm) fail("Passwords do not match.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await siteUrl()}/auth/confirm` },
  });
  if (error) fail(error.message);

  // If email confirmation is switched off in Supabase, the user is signed in straight away.
  if (data.session) redirect("/");

  redirect(`/register?sent=${encodeURIComponent(email)}`);
}

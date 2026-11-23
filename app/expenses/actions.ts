"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { numField, optNum, optStr, str } from "@/lib/forms";

const CATEGORIES = ["ingredient", "packaging", "utilities", "other"] as const;

function fail(msg: string): never {
  redirect(`/expenses?error=${encodeURIComponent(msg)}`);
}

export async function addExpense(fd: FormData) {
  const { supabase } = await requireUser();
  const ingredient_id = optStr(fd, "ingredient_id");
  const quantity = optNum(fd, "quantity");
  const amount = numField(fd, "amount");
  const expense_date = str(fd, "expense_date");
  const catRaw = str(fd, "category");
  const category = (CATEGORIES as readonly string[]).includes(catRaw) ? catRaw : "other";
  let description = str(fd, "description");

  if (!(amount >= 0)) fail("Amount must be a number (0 or more).");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) fail("Please pick a date.");
  if (quantity !== null && !(quantity > 0)) fail("Quantity must be more than 0.");

  let ingredientName: string | null = null;
  if (ingredient_id) {
    const { data } = await supabase.from("ingredients").select("name").eq("id", ingredient_id).maybeSingle();
    ingredientName = data?.name ?? null;
  }
  if (!description) description = ingredientName ?? "";
  if (!description) fail("Please add a description or choose an ingredient.");

  const { error } = await supabase
    .from("expenses")
    .insert({ expense_date, category, ingredient_id, quantity, amount, description });
  if (error) fail(error.message);

  // Keep the ingredient's pack price up to date with what you just paid.
  if (ingredient_id && fd.get("update_price") === "on") {
    const perPack = amount / (quantity ?? 1);
    await supabase
      .from("ingredients")
      .update({ pack_price: Math.round(perPack * 100) / 100 })
      .eq("id", ingredient_id);
  }

  revalidatePath("/", "layout");
  redirect(`/expenses?month=${expense_date.slice(0, 7)}`);
}

export async function deleteExpense(fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("expenses").delete().eq("id", str(fd, "id"));
  if (error) fail(error.message);
  revalidatePath("/", "layout");
  redirect(`/expenses${str(fd, "month") ? `?month=${str(fd, "month")}` : ""}`);
}

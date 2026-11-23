"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { numField, optStr, str } from "@/lib/forms";

function fail(msg: string): never {
  redirect(`/sales?error=${encodeURIComponent(msg)}`);
}

export async function addSale(fd: FormData) {
  const { supabase } = await requireUser();
  const sale_date = str(fd, "sale_date");
  const pieces = Math.round(numField(fd, "pieces"));
  const price_per_piece = numField(fd, "price_per_piece");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sale_date)) fail("Please pick a date.");
  if (!(pieces > 0)) fail("Pieces sold must be at least 1.");
  if (!(price_per_piece >= 0)) fail("Price per piece must be 0 or more.");

  const { error } = await supabase.from("sales").insert({
    sale_date,
    pieces,
    price_per_piece,
    recipe_id: optStr(fd, "recipe_id"),
    customer: optStr(fd, "sale_customer"),
    notes: optStr(fd, "notes"),
  });
  if (error) fail(error.message);
  revalidatePath("/", "layout");
  redirect(`/sales?month=${sale_date.slice(0, 7)}`);
}

export async function deleteSale(fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("sales").delete().eq("id", str(fd, "id"));
  if (error) fail(error.message);
  revalidatePath("/", "layout");
  redirect(`/sales${str(fd, "month") ? `?month=${str(fd, "month")}` : ""}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { numField, str } from "@/lib/forms";

function fail(msg: string): never {
  redirect(`/ingredients?error=${encodeURIComponent(msg)}`);
}

function parse(fd: FormData) {
  const name = str(fd, "name");
  const pack_price = numField(fd, "pack_price");
  const pack_size = numField(fd, "pack_size");
  const unit = str(fd, "unit") || "g";
  if (!name) fail("Please enter the ingredient name.");
  if (!(pack_price >= 0)) fail("Pack price must be a number (0 or more).");
  if (!(pack_size > 0)) fail("Pack size must be more than 0.");
  return { name, pack_price, pack_size, unit };
}

export async function addIngredient(fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("ingredients").insert(parse(fd));
  if (error) fail(error.message);
  revalidatePath("/", "layout");
  redirect("/ingredients");
}

export async function updateIngredient(fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("ingredients").update(parse(fd)).eq("id", str(fd, "id"));
  if (error) fail(error.message);
  revalidatePath("/", "layout");
  redirect("/ingredients");
}

export async function deleteIngredient(fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("ingredients").delete().eq("id", str(fd, "id"));
  if (error) {
    fail(
      error.code === "23503"
        ? "This ingredient is used in a recipe. Remove it from the recipe first."
        : error.message,
    );
  }
  revalidatePath("/", "layout");
  redirect("/ingredients");
}

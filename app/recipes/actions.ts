"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { numField, optStr, str } from "@/lib/forms";

function fail(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

export async function createRecipe(fd: FormData) {
  const { supabase } = await requireUser();
  const name = str(fd, "recipe_name");
  if (!name) fail("/recipes", "Please give the recipe a name.");
  const { data, error } = await supabase.from("recipes").insert({ name }).select("id").single();
  if (error) fail("/recipes", error.message);
  revalidatePath("/", "layout");
  redirect(`/recipes/${data.id}`);
}

export async function updateRecipeSettings(fd: FormData) {
  const { supabase } = await requireUser();
  const id = str(fd, "id");
  const path = `/recipes/${id}`;
  const name = str(fd, "recipe_name");
  const pan_size_inch = numField(fd, "pan_size_inch");
  const default_rows = Math.round(numField(fd, "default_rows"));
  const default_cols = Math.round(numField(fd, "default_cols"));
  const target_margin = numField(fd, "target_margin");
  const rounding_step = numField(fd, "rounding_step");
  if (!name) fail(path, "Recipe name can't be empty.");
  if (!(pan_size_inch > 0)) fail(path, "Pan size must be more than 0.");
  if (!(default_rows >= 1 && default_rows <= 30)) fail(path, "Rows must be between 1 and 30.");
  if (!(default_cols >= 1 && default_cols <= 30)) fail(path, "Columns must be between 1 and 30.");
  if (!(target_margin >= 0 && target_margin < 100)) fail(path, "Margin must be between 0 and 99%.");
  if (!(rounding_step >= 0)) fail(path, "Rounding must be 0 or more.");
  const { error } = await supabase
    .from("recipes")
    .update({ name, pan_size_inch, default_rows, default_cols, target_margin, rounding_step, notes: optStr(fd, "notes") })
    .eq("id", id);
  if (error) {
    fail(
      path,
      error.message.includes("default_rows") || error.message.includes("default_cols")
        ? "Database needs a quick update: run supabase/migrations/002_cut_rows_cols.sql in the Supabase SQL Editor."
        : error.message,
    );
  }
  revalidatePath("/", "layout");
  redirect(path);
}

export async function deleteRecipe(fd: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("recipes").delete().eq("id", str(fd, "id"));
  if (error) fail("/recipes", error.message);
  revalidatePath("/", "layout");
  redirect("/recipes");
}

export async function addRecipeItem(fd: FormData) {
  const { supabase } = await requireUser();
  const recipe_id = str(fd, "recipe_id");
  const path = `/recipes/${recipe_id}`;
  const ingredient_id = str(fd, "ingredient_id");
  const quantity_used = numField(fd, "quantity_used");
  if (!ingredient_id) fail(path, "Choose an ingredient.");
  if (!(quantity_used > 0)) fail(path, "Quantity used must be more than 0.");
  const { error } = await supabase
    .from("recipe_items")
    .upsert({ recipe_id, ingredient_id, quantity_used }, { onConflict: "recipe_id,ingredient_id" });
  if (error) fail(path, error.message);
  revalidatePath("/", "layout");
  redirect(path);
}

export async function deleteRecipeItem(fd: FormData) {
  const { supabase } = await requireUser();
  const path = `/recipes/${str(fd, "recipe_id")}`;
  const { error } = await supabase.from("recipe_items").delete().eq("id", str(fd, "id"));
  if (error) fail(path, error.message);
  revalidatePath("/", "layout");
  redirect(path);
}

export async function addExtraCost(fd: FormData) {
  const { supabase } = await requireUser();
  const recipe_id = str(fd, "recipe_id");
  const path = `/recipes/${recipe_id}`;
  const name = str(fd, "cost_name");
  const amount = numField(fd, "amount");
  const cost_type = str(fd, "cost_type") === "per_piece" ? "per_piece" : "per_loyang";
  if (!name) fail(path, "Name the extra cost (e.g. Plastic wrap).");
  if (!(amount >= 0)) fail(path, "Amount must be 0 or more.");
  const { error } = await supabase.from("extra_costs").insert({ recipe_id, name, amount, cost_type });
  if (error) fail(path, error.message);
  revalidatePath("/", "layout");
  redirect(path);
}

export async function deleteExtraCost(fd: FormData) {
  const { supabase } = await requireUser();
  const path = `/recipes/${str(fd, "recipe_id")}`;
  const { error } = await supabase.from("extra_costs").delete().eq("id", str(fd, "id"));
  if (error) fail(path, error.message);
  revalidatePath("/", "layout");
  redirect(path);
}

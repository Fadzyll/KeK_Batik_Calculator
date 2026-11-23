import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExtraCostRow, Recipe, RecipeItem } from "./types";

export type RecipeWithCosts = Recipe & { items: RecipeItem[]; extras: ExtraCostRow[] };

const SELECT =
  "*, items:recipe_items(id, recipe_id, quantity_used, ingredient:ingredients(*)), extras:extra_costs(*)";

export async function fetchRecipes(supabase: SupabaseClient): Promise<RecipeWithCosts[]> {
  const { data } = await supabase.from("recipes").select(SELECT).order("created_at");
  return (data ?? []) as unknown as RecipeWithCosts[];
}

export async function fetchRecipe(supabase: SupabaseClient, id: string): Promise<RecipeWithCosts | null> {
  const { data } = await supabase.from("recipes").select(SELECT).eq("id", id).maybeSingle();
  return (data as unknown as RecipeWithCosts) ?? null;
}

export function pricingInput(r: RecipeWithCosts) {
  return {
    items: r.items.map((i) => ({
      quantity_used: Number(i.quantity_used),
      ingredient: { pack_price: Number(i.ingredient.pack_price), pack_size: Number(i.ingredient.pack_size) },
    })),
    extras: r.extras.map((e) => ({ amount: Number(e.amount), cost_type: e.cost_type })),
    panSizeInch: Number(r.pan_size_inch),
    targetMargin: Number(r.target_margin),
    roundingStep: Number(r.rounding_step),
  };
}

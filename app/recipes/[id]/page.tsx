import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { fetchRecipe, pricingInput } from "@/lib/recipes";
import { extraCostTotals, ingredientCostPerLoyang, itemCost } from "@/lib/pricing";
import { num, rm } from "@/lib/format";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteButton } from "@/components/DeleteButton";
import { FormError } from "@/components/FormError";
import { PricingCalculator } from "./PricingCalculator";
import {
  addExtraCost,
  addRecipeItem,
  deleteExtraCost,
  deleteRecipe,
  deleteRecipeItem,
  updateRecipeSettings,
} from "../actions";
import type { Ingredient } from "@/lib/types";

export default async function RecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase } = await requireUser();
  const [recipe, { data: ingData }] = await Promise.all([
    fetchRecipe(supabase, id),
    supabase.from("ingredients").select("*").order("name"),
  ]);
  if (!recipe) notFound();
  const ingredients = (ingData ?? []) as Ingredient[];
  const input = pricingInput(recipe);
  const ingredientTotal = ingredientCostPerLoyang(input.items);
  const extras = extraCostTotals(input.extras);
  const items = [...recipe.items].sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/recipes" className="text-sm text-cocoa-500 hover:underline">← All recipes</Link>
        <h1 className="h1">{recipe.name}</h1>
        <p className="muted">
          Ingredients {rm(ingredientTotal)} + extras {rm(extras.perLoyang)} per loyang
          {extras.perPiece > 0 && <> + {rm(extras.perPiece)} per piece</>}
        </p>
      </div>

      <FormError message={error} />

      {/* Ingredients used */}
      <section className="card">
        <h2 className="h2">Ingredients used in one loyang</h2>
        {ingredients.length === 0 ? (
          <p className="muted">
            You have no ingredients yet. <Link href="/ingredients" className="underline">Add ingredients first</Link>.
          </p>
        ) : (
          <form action={addRecipeItem} autoComplete="off" className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
            <input type="hidden" name="recipe_id" value={recipe.id} />
            <div className="col-span-2">
              <label className="label">Ingredient</label>
              <select name="ingredient_id" required className="input" defaultValue="">
                <option value="" disabled>Choose…</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({num(i.pack_size, 3)} {i.unit} @ {rm(i.pack_price)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount used (same unit as pack)</label>
              <input name="quantity_used" type="number" step="any" min="0" required placeholder="e.g. 250" className="input" />
            </div>
            <SubmitButton>Add / update</SubmitButton>
          </form>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th className="text-right">Used</th>
                  <th className="text-right">Cost</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.ingredient.name}</td>
                    <td className="text-right">
                      {num(it.quantity_used, 3)} {it.ingredient.unit}
                      <span className="text-cocoa-400"> / {num(it.ingredient.pack_size, 3)}</span>
                    </td>
                    <td className="text-right">
                      {rm(itemCost({ quantity_used: Number(it.quantity_used), ingredient: it.ingredient }))}
                    </td>
                    <td className="text-right">
                      <DeleteButton action={deleteRecipeItem} id={it.id} label="Remove" extra={{ recipe_id: recipe.id }} />
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={2}>Total ingredients per loyang</td>
                  <td className="text-right">{rm(ingredientTotal)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Extra costs */}
      <section className="card">
        <h2 className="h2">Extra costs</h2>
        <p className="muted mb-3">Packaging, gas/electricity, your labour. Per loyang, or per piece (like a plastic wrap or box for each piece).</p>
        <form action={addExtraCost} autoComplete="off" className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
          <input type="hidden" name="recipe_id" value={recipe.id} />
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Name</label>
            <input name="cost_name" required autoComplete="off" placeholder="e.g. Plastic wrap" className="input" />
          </div>
          <div>
            <label className="label">Amount (RM)</label>
            <input name="amount" type="number" step="0.01" min="0" required placeholder="0.10" className="input" />
          </div>
          <div>
            <label className="label">Charged</label>
            <select name="cost_type" className="input">
              <option value="per_loyang">Per loyang</option>
              <option value="per_piece">Per piece</option>
            </select>
          </div>
          <SubmitButton className="btn col-span-2 sm:col-span-1">Add</SubmitButton>
        </form>
        {recipe.extras.length > 0 && (
          <table className="table">
            <tbody>
              {recipe.extras.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td className="text-cocoa-500">{e.cost_type === "per_piece" ? "per piece" : "per loyang"}</td>
                  <td className="text-right">{rm(e.amount)}</td>
                  <td className="text-right">
                    <DeleteButton action={deleteExtraCost} id={e.id} label="Remove" extra={{ recipe_id: recipe.id }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <PricingCalculator
        recipe={{
          id: recipe.id,
          name: recipe.name,
          pan_size_inch: Number(recipe.pan_size_inch),
          default_grid: recipe.default_grid,
          target_margin: Number(recipe.target_margin),
          rounding_step: Number(recipe.rounding_step),
          notes: recipe.notes,
        }}
        input={{ items: input.items, extras: input.extras }}
        action={updateRecipeSettings}
      />

      <div className="flex justify-end">
        <DeleteButton action={deleteRecipe} id={recipe.id} label="Delete this recipe" />
      </div>
    </div>
  );
}

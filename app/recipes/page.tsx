import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { createRecipe } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { cutOf, fetchRecipes, pricingInput } from "@/lib/recipes";
import { ingredientCostPerLoyang, pricingForCut } from "@/lib/pricing";
import { rm } from "@/lib/format";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await requireUser();
  const recipes = await fetchRecipes(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Recipes &amp; Pricing</h1>
        <p className="muted">One recipe = one loyang. Add what goes in it, and the app suggests a price per piece.</p>
      </div>

      <FormError message={error} />

      <form action={createRecipe} autoComplete="off" className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">New recipe name</label>
          <input name="recipe_name" required autoComplete="off" placeholder="e.g. Kek Batik Milo Original" className="input" />
        </div>
        <SubmitButton>Create recipe</SubmitButton>
      </form>

      {recipes.length === 0 ? (
        <p className="card muted py-8 text-center">No recipes yet. Create one above to start pricing.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((r) => {
            const input = pricingInput(r);
            const p = pricingForCut(input, cutOf(r).rows, cutOf(r).cols);
            return (
              <Link key={r.id} href={`/recipes/${r.id}`} className="card block transition hover:border-cocoa-400">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-cocoa-900">{r.name}</h2>
                  <span className="rounded-full bg-cocoa-100 px-2 py-0.5 text-xs text-cocoa-700">
                    {p.rows}×{p.cols} = {p.pieces} pcs
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-cocoa-500">Ingredients/loyang</dt>
                    <dd className="font-medium">{rm(ingredientCostPerLoyang(input.items))}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-cocoa-500">Cost/piece</dt>
                    <dd className="font-medium">{rm(p.costPerPiece)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-cocoa-500">Sell at</dt>
                    <dd className="text-lg font-bold text-cocoa-700">{rm(p.suggestedPrice)}</dd>
                  </div>
                </dl>
                {r.items.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">No ingredients added yet. Tap to set up.</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { requireUser } from "@/lib/supabase/server";
import { addIngredient, deleteIngredient, updateIngredient } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteButton } from "@/components/DeleteButton";
import { FormError } from "@/components/FormError";
import { UNITS, num, rm } from "@/lib/format";
import type { Ingredient } from "@/lib/types";

function IngredientFields({ ing }: { ing?: Ingredient }) {
  return (
    <>
      <div className="col-span-2 sm:col-span-1">
        <label className="label">Name</label>
        <input name="ingredient_name" required autoComplete="off" defaultValue={ing?.name} placeholder="e.g. Milo" className="input" />
      </div>
      <div>
        <label className="label">Pack price (RM)</label>
        <input name="pack_price" type="number" step="0.01" min="0" required defaultValue={ing?.pack_price} placeholder="32.90" className="input" />
      </div>
      <div>
        <label className="label">Pack size</label>
        <input name="pack_size" type="number" step="any" min="0" required defaultValue={ing?.pack_size} placeholder="1000" className="input" />
      </div>
      <div>
        <label className="label">Unit</label>
        <select name="unit" defaultValue={ing?.unit ?? "g"} className="input">
          {UNITS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { error, edit } = await searchParams;
  const { supabase } = await requireUser();
  const { data } = await supabase.from("ingredients").select("*").order("name");
  const ingredients = (data ?? []) as Ingredient[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Ingredients</h1>
        <p className="muted">
          Enter the price and size of each pack you buy. Recipes use this to work out how much each loyang costs.
        </p>
      </div>

      <FormError message={error} />

      <form action={addIngredient} autoComplete="off" className="card">
        <h2 className="h2">Add ingredient</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:items-end">
          <IngredientFields />
          <SubmitButton className="btn col-span-2 sm:col-span-1">Add</SubmitButton>
        </div>
      </form>

      <div className="card overflow-x-auto">
        {ingredients.length === 0 ? (
          <p className="muted py-6 text-center">No ingredients yet. Add your first one above (e.g. Marie biscuits, Milo, butter, condensed milk).</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Pack</th>
                <th className="text-right">Price</th>
                <th className="text-right">Per unit</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) =>
                edit === ing.id ? (
                  <tr key={ing.id}>
                    <td colSpan={5}>
                      <form action={updateIngredient} autoComplete="off" className="grid grid-cols-2 gap-3 py-2 sm:grid-cols-6 sm:items-end">
                        <input type="hidden" name="id" value={ing.id} />
                        <IngredientFields ing={ing} />
                        <div className="col-span-2 flex gap-2 sm:col-span-1">
                          <SubmitButton>Save</SubmitButton>
                          <a href="/ingredients" className="btn-ghost">Cancel</a>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={ing.id}>
                    <td className="font-medium">{ing.name}</td>
                    <td>
                      {num(ing.pack_size, 3)} {ing.unit}
                    </td>
                    <td className="text-right">{rm(ing.pack_price)}</td>
                    <td className="text-right text-cocoa-500">
                      {rm(Number(ing.pack_price) / Number(ing.pack_size), 4)}/{ing.unit}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <a href={`/ingredients?edit=${ing.id}`} className="btn-ghost">Edit</a>
                      <DeleteButton action={deleteIngredient} id={ing.id} />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

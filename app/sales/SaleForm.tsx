"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

type RecipeOption = { id: string; name: string; suggestedPrice: number; pieces: number };

export function SaleForm({
  recipes,
  today,
  action,
}: {
  recipes: RecipeOption[];
  today: string;
  action: (fd: FormData) => void | Promise<void>;
}) {
  const first = recipes[0];
  const [recipeId, setRecipeId] = useState(first?.id ?? "");
  const [price, setPrice] = useState(first ? first.suggestedPrice.toFixed(2) : "");
  const [pieces, setPieces] = useState("1");
  const selected = recipes.find((r) => r.id === recipeId);
  const total = (Number(pieces) || 0) * (Number(price) || 0);

  return (
    <form action={action} className="card">
      <h2 className="h2">Record a sale</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:items-end">
        <div>
          <label className="label">Date</label>
          <input name="sale_date" type="date" required defaultValue={today} className="input" />
        </div>
        <div className="col-span-2">
          <label className="label">Kek batik</label>
          <select
            name="recipe_id"
            value={recipeId}
            onChange={(e) => {
              setRecipeId(e.target.value);
              const r = recipes.find((x) => x.id === e.target.value);
              if (r) setPrice(r.suggestedPrice.toFixed(2));
            }}
            className="input"
          >
            <option value="">Not specified</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Pieces sold</label>
          <input
            name="pieces"
            type="number"
            min="1"
            step="1"
            required
            value={pieces}
            onChange={(e) => setPieces(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Price/piece (RM)</label>
          <input
            name="price_per_piece"
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Customer</label>
          <input name="customer" placeholder="Optional" className="input" />
        </div>
        <div className="col-span-2 sm:col-span-4">
          <label className="label">Notes</label>
          <input name="notes" placeholder="Optional (e.g. paid via DuitNow, delivered)" className="input" />
        </div>
        <div className="col-span-2 flex items-center justify-between gap-3">
          <p className="text-sm">
            Total <b className="text-lg text-cocoa-800">RM{total.toFixed(2)}</b>
          </p>
          <SubmitButton>Save sale</SubmitButton>
        </div>
      </div>
      {selected && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="text-cocoa-500">Quick fill:</span>
          <button type="button" className="btn-ghost border border-cocoa-200" onClick={() => setPieces(String(selected.pieces))}>
            Whole loyang ({selected.pieces} pcs)
          </button>
          <button type="button" className="btn-ghost border border-cocoa-200" onClick={() => setPrice(selected.suggestedPrice.toFixed(2))}>
            Suggested price RM{selected.suggestedPrice.toFixed(2)}
          </button>
        </div>
      )}
    </form>
  );
}

import { requireUser } from "@/lib/supabase/server";
import { addSale, deleteSale } from "./actions";
import { SaleForm } from "./SaleForm";
import { DeleteButton } from "@/components/DeleteButton";
import { FormError } from "@/components/FormError";
import { MonthPicker } from "@/components/MonthPicker";
import { cutOf, fetchRecipes, pricingInput } from "@/lib/recipes";
import { pricingForCut } from "@/lib/pricing";
import { formatDate, monthLabel, monthRange, rm, todayMY, validMonth } from "@/lib/format";
import type { Sale } from "@/lib/types";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const month = validMonth(sp.month);
  const { start, end } = monthRange(month);
  const { supabase } = await requireUser();

  const [recipes, { data }] = await Promise.all([
    fetchRecipes(supabase),
    supabase
      .from("sales")
      .select("*, recipe:recipes(name)")
      .gte("sale_date", start)
      .lt("sale_date", end)
      .order("sale_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  const sales = (data ?? []) as Sale[];
  const revenue = sales.reduce((s, x) => s + Number(x.total), 0);
  const pieces = sales.reduce((s, x) => s + x.pieces, 0);

  const recipeOptions = recipes.map((r) => {
    const p = pricingForCut(pricingInput(r), cutOf(r).rows, cutOf(r).cols);
    return { id: r.id, name: r.name, suggestedPrice: p.suggestedPrice, pieces: p.pieces };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Sales</h1>
        <p className="muted">Log what you sell. The price fills in automatically from your recipe pricing.</p>
      </div>

      <FormError message={sp.error} />

      <SaleForm recipes={recipeOptions} today={todayMY()} action={addSale} />

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="h2 mb-0">{monthLabel(month)}</h2>
            <p className="text-2xl font-bold text-cocoa-800">
              {rm(revenue)} <span className="text-sm font-normal text-cocoa-500">from {pieces} pieces</span>
            </p>
          </div>
          <MonthPicker month={month} />
        </div>
        {sales.length === 0 ? (
          <p className="muted py-6 text-center">No sales this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Customer</th>
                  <th className="text-right">Qty × Price</th>
                  <th className="text-right">Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap">{formatDate(s.sale_date)}</td>
                    <td>
                      {s.recipe?.name ?? <span className="text-cocoa-400">N/A</span>}
                      {s.notes && <div className="text-xs text-cocoa-400">{s.notes}</div>}
                    </td>
                    <td>{s.customer ?? ""}</td>
                    <td className="text-right whitespace-nowrap">
                      {s.pieces} × {rm(s.price_per_piece)}
                    </td>
                    <td className="text-right font-medium">{rm(s.total)}</td>
                    <td className="text-right">
                      <DeleteButton action={deleteSale} id={s.id} extra={{ month }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

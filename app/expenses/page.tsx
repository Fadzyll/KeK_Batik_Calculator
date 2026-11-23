import { requireUser } from "@/lib/supabase/server";
import { addExpense, deleteExpense } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteButton } from "@/components/DeleteButton";
import { FormError } from "@/components/FormError";
import { MonthPicker } from "@/components/MonthPicker";
import { formatDate, monthLabel, monthRange, num, rm, todayMY, validMonth } from "@/lib/format";
import type { Expense, Ingredient } from "@/lib/types";

const CATEGORY_LABEL: Record<Expense["category"], string> = {
  ingredient: "Ingredient",
  packaging: "Packaging",
  utilities: "Gas / utilities",
  other: "Other",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const month = validMonth(sp.month);
  const { start, end } = monthRange(month);
  const { supabase } = await requireUser();

  const [{ data: expData }, { data: ingData }] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .gte("expense_date", start)
      .lt("expense_date", end)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("ingredients").select("*").order("name"),
  ]);
  const expenses = (expData ?? []) as Expense[];
  const ingredients = (ingData ?? []) as Ingredient[];

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Expenses</h1>
        <p className="muted">Record every purchase: ingredients, boxes, gas. It all adds up on the dashboard.</p>
      </div>

      <FormError message={sp.error} />

      <form action={addExpense} className="card">
        <h2 className="h2">Add expense</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:items-end">
          <div>
            <label className="label">Date</label>
            <input name="expense_date" type="date" required defaultValue={todayMY()} className="input" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" className="input" defaultValue="ingredient">
              {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Ingredient (optional)</label>
            <select name="ingredient_id" className="input" defaultValue="">
              <option value="">None</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({num(i.pack_size, 3)} {i.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Packs bought</label>
            <input name="quantity" type="number" step="any" min="0" placeholder="1" className="input" />
          </div>
          <div>
            <label className="label">Total paid (RM)</label>
            <input name="amount" type="number" step="0.01" min="0" required placeholder="0.00" className="input" />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <label className="label">Description</label>
            <input name="description" placeholder="Optional if you picked an ingredient (e.g. Kotak 8x8, Gas refill)" className="input" />
          </div>
          <SubmitButton className="btn col-span-2">Add expense</SubmitButton>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-cocoa-700">
          <input type="checkbox" name="update_price" defaultChecked className="accent-cocoa-700" />
          Update the ingredient&apos;s pack price to what I paid (total ÷ packs)
        </label>
      </form>

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="h2 mb-0">{monthLabel(month)}</h2>
            <p className="text-2xl font-bold text-cocoa-800">{rm(total)}</p>
          </div>
          <MonthPicker month={month} />
        </div>
        {Object.keys(byCat).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(byCat).map(([c, v]) => (
              <span key={c} className="rounded-full bg-cocoa-100 px-3 py-1 text-xs text-cocoa-700">
                {CATEGORY_LABEL[c as Expense["category"]]}: <b>{rm(v)}</b>
              </span>
            ))}
          </div>
        )}
        {expenses.length === 0 ? (
          <p className="muted py-6 text-center">No expenses this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{formatDate(e.expense_date)}</td>
                    <td>
                      {e.description}
                      {e.quantity && e.ingredient_id && (
                        <span className="text-cocoa-400"> × {num(e.quantity)}</span>
                      )}
                    </td>
                    <td className="text-cocoa-500">{CATEGORY_LABEL[e.category]}</td>
                    <td className="text-right">{rm(e.amount)}</td>
                    <td className="text-right">
                      <DeleteButton action={deleteExpense} id={e.id} extra={{ month }} />
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

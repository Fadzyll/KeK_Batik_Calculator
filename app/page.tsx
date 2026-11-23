import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { cutOf, fetchRecipes, pricingInput } from "@/lib/recipes";
import { pricingForCut } from "@/lib/pricing";
import { monthLabel, monthRange, rm, thisMonthMY } from "@/lib/format";

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-MY", { month: "short", year: "2-digit" });
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-cocoa-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-600" : "text-cocoa-900"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-cocoa-500">{sub}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const { supabase } = await requireUser();
  const current = thisMonthMY();
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(current, i - 5));
  const from = monthRange(months[0]).start;
  const to = monthRange(current).end;

  const [recipes, { data: exp }, { data: sal }] = await Promise.all([
    fetchRecipes(supabase),
    supabase.from("expenses").select("expense_date, amount").gte("expense_date", from).lt("expense_date", to),
    supabase.from("sales").select("sale_date, total, pieces, recipe_id").gte("sale_date", from).lt("sale_date", to),
  ]);

  const rows = months.map((m) => {
    const expenses = (exp ?? [])
      .filter((e) => e.expense_date.startsWith(m))
      .reduce((s, e) => s + Number(e.amount), 0);
    const monthSales = (sal ?? []).filter((s) => s.sale_date.startsWith(m));
    const revenue = monthSales.reduce((s, x) => s + Number(x.total), 0);
    const pieces = monthSales.reduce((s, x) => s + Number(x.pieces), 0);
    return { month: m, expenses, revenue, pieces, profit: revenue - expenses };
  });
  const now = rows[rows.length - 1];
  const max = Math.max(1, ...rows.flatMap((r) => [r.expenses, r.revenue]));

  // Best sellers this month
  const recipeName = new Map(recipes.map((r) => [r.id, r.name]));
  const bySeller = new Map<string, { pieces: number; revenue: number }>();
  for (const s of (sal ?? []).filter((x) => x.sale_date.startsWith(current))) {
    const key = s.recipe_id ? (recipeName.get(s.recipe_id) ?? "Deleted recipe") : "Not specified";
    const cur = bySeller.get(key) ?? { pieces: 0, revenue: 0 };
    cur.pieces += Number(s.pieces);
    cur.revenue += Number(s.total);
    bySeller.set(key, cur);
  }
  const sellers = [...bySeller.entries()].sort((a, b) => b[1].revenue - a[1].revenue);

  const needsSetup = recipes.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Dashboard</h1>
        <p className="muted">{monthLabel(current)} at a glance</p>
      </div>

      {needsSetup && (
        <div className="card border-amber-300 bg-amber-50">
          <h2 className="h2">Get started in 3 steps</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-cocoa-800">
            <li><Link href="/ingredients" className="underline">Add your ingredients</Link> with the pack price and size.</li>
            <li><Link href="/recipes" className="underline">Create a recipe</Link> and say how much of each ingredient one loyang uses.</li>
            <li>Get your price per piece, then start recording <Link href="/expenses" className="underline">expenses</Link> and <Link href="/sales" className="underline">sales</Link>.</li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sales this month" value={rm(now.revenue)} sub={`${now.pieces} pieces sold`} />
        <Stat label="Expenses this month" value={rm(now.expenses)} />
        <Stat
          label="Profit this month"
          value={rm(now.profit)}
          sub="Sales − expenses"
          tone={now.profit > 0 ? "good" : now.profit < 0 ? "bad" : undefined}
        />
        <Stat
          label="6-month profit"
          value={rm(rows.reduce((s, r) => s + r.profit, 0))}
          sub={`${rm(rows.reduce((s, r) => s + r.revenue, 0))} sales`}
        />
      </div>

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="h2 mb-0">Last 6 months</h2>
          <div className="flex gap-4 text-xs text-cocoa-600">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Sales</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-cocoa-400" />Expenses</span>
          </div>
        </div>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.month} className="grid grid-cols-[4.5rem_1fr_6rem] items-center gap-3 text-sm">
              <span className="text-cocoa-600">{shortMonth(r.month)}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 rounded-sm bg-emerald-600" style={{ width: `${(r.revenue / max) * 100}%` }} />
                  <span className="text-xs text-cocoa-500">{rm(r.revenue, 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 rounded-sm bg-cocoa-400" style={{ width: `${(r.expenses / max) * 100}%` }} />
                  <span className="text-xs text-cocoa-500">{rm(r.expenses, 0)}</span>
                </div>
              </div>
              <span className={`text-right font-medium ${r.profit < 0 ? "text-red-600" : "text-cocoa-800"}`}>
                {rm(r.profit)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="h2">Your prices</h2>
          {recipes.length === 0 ? (
            <p className="muted">No recipes yet.</p>
          ) : (
            <table className="table">
              <tbody>
                {recipes.map((r) => {
                  const p = pricingForCut(pricingInput(r), cutOf(r).rows, cutOf(r).cols);
                  return (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/recipes/${r.id}`} className="hover:underline">{r.name}</Link>
                        <div className="text-xs text-cocoa-400">{p.pieces} pcs · cost {rm(p.costPerPiece)}</div>
                      </td>
                      <td className="text-right text-lg font-bold text-cocoa-700">{rm(p.suggestedPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h2 className="h2">Best sellers this month</h2>
          {sellers.length === 0 ? (
            <p className="muted">No sales yet this month.</p>
          ) : (
            <table className="table">
              <tbody>
                {sellers.map(([name, v]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className="text-right text-cocoa-500">{v.pieces} pcs</td>
                    <td className="text-right font-medium">{rm(v.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { COMMON_CUTS, marginOf, pricingForCut, type PricingInput } from "@/lib/pricing";
import { SubmitButton } from "@/components/SubmitButton";
import { CutInfoButton } from "@/components/CutGuide";

const rm = (n: number) => `RM${n.toFixed(2)}`;
const inch = (n: number) => `${Number(n.toFixed(2))}″`;
const clampCut = (v: string) => Math.min(30, Math.max(1, Math.round(Number(v) || 1)));

type Props = {
  recipe: {
    id: string;
    name: string;
    pan_size_inch: number;
    default_rows: number;
    default_cols: number;
    target_margin: number;
    rounding_step: number;
    notes: string | null;
  };
  input: Omit<PricingInput, "panSizeInch" | "targetMargin" | "roundingStep">;
  action: (fd: FormData) => void | Promise<void>;
};

export function PricingCalculator({ recipe, input, action }: Props) {
  const [pan, setPan] = useState(String(recipe.pan_size_inch));
  // Kept as text so the box can be cleared while typing; clamped to 1–30 when used.
  const [rowsText, setRowsText] = useState(String(recipe.default_rows));
  const [colsText, setColsText] = useState(String(recipe.default_cols));
  const rows = clampCut(rowsText);
  const cols = clampCut(colsText);
  const pick = (r: number, c: number) => {
    setRowsText(String(r));
    setColsText(String(c));
  };
  const [margin, setMargin] = useState(Number(recipe.target_margin));
  const [step, setStep] = useState(String(recipe.rounding_step));
  const [ownPrice, setOwnPrice] = useState("");

  const full: PricingInput = {
    ...input,
    panSizeInch: Number(pan) || 8,
    targetMargin: margin,
    roundingStep: Number(step) || 0,
  };

  // Common cuts plus whatever the user typed, ordered by number of pieces
  const cuts = useMemo(() => {
    const seen = new Set<string>();
    const list: [number, number][] = [];
    for (const [r, c] of [...COMMON_CUTS, [rows, cols] as [number, number]]) {
      const key = `${r}x${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push([r, c]);
      }
    }
    return list.sort((a, b) => a[0] * a[1] - b[0] * b[1] || a[0] - b[0]);
  }, [rows, cols]);

  const selected = pricingForCut(full, rows, cols);
  const own = Number(ownPrice);
  const hasOwn = ownPrice !== "" && own > 0;

  return (
    <form action={action} autoComplete="off" className="card space-y-5">
      <input type="hidden" name="id" value={recipe.id} />
      <div className="flex items-center justify-between">
        <h2 className="h2 mb-0">Price per piece</h2>
      </div>

      {/* Headline */}
      <div className="rounded-xl bg-cocoa-800 p-4 text-white sm:p-5">
        <p className="flex flex-wrap items-center gap-2 text-sm text-cocoa-200">
          <span>
            Cut {rows} rows × {cols} columns → <b>{selected.pieces} pieces</b> of{" "}
            {inch(selected.pieceWidthInch)} × {inch(selected.pieceLengthInch)}
          </span>
          <CutInfoButton rows={rows} cols={cols} panInch={full.panSizeInch} price={selected.suggestedPrice} light />
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2">
          <div>
            <p className="text-xs text-cocoa-300">Suggested selling price</p>
            <p className="text-4xl font-bold">
              {rm(selected.suggestedPrice)}
              <span className="text-base font-normal text-cocoa-300"> / piece</span>
            </p>
          </div>
          <div className="text-sm">
            <p>Cost per piece: <b>{rm(selected.costPerPiece)}</b></p>
            <p>Profit per piece: <b>{rm(selected.profitPerPiece)}</b> ({selected.actualMargin.toFixed(0)}%)</p>
          </div>
          <div className="text-sm">
            <p>Sell whole loyang: <b>{rm(selected.revenuePerLoyang)}</b></p>
            <p>Profit per loyang: <b>{rm(selected.profitPerLoyang)}</b></p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="label">Cut into (rows × columns)</span>
          <div className="flex items-center gap-2">
            <input
              name="default_rows"
              type="number"
              min={1}
              max={30}
              required
              aria-label="Rows"
              value={rowsText}
              onChange={(e) => setRowsText(e.target.value)}
              onBlur={() => setRowsText(String(rows))}
              className="input text-center"
            />
            <span className="text-cocoa-500">×</span>
            <input
              name="default_cols"
              type="number"
              min={1}
              max={30}
              required
              aria-label="Columns"
              value={colsText}
              onChange={(e) => setColsText(e.target.value)}
              onBlur={() => setColsText(String(cols))}
              className="input text-center"
            />
          </div>
          <p className="mt-1 text-[11px] text-cocoa-500">e.g. 4 × 2 = 8 pieces</p>
        </div>
        <div>
          <label className="label">Target profit margin: {margin}%</label>
          <input
            name="target_margin"
            type="range"
            min={0}
            max={90}
            step={5}
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-full accent-cocoa-700"
          />
        </div>
        <div>
          <label className="label">Round price up to</label>
          <select name="rounding_step" value={step} onChange={(e) => setStep(e.target.value)} className="input">
            <option value="0">No rounding</option>
            <option value="0.1">RM0.10</option>
            <option value="0.2">RM0.20</option>
            <option value="0.5">RM0.50</option>
            <option value="1">RM1.00</option>
          </select>
        </div>
        <div>
          <label className="label">Loyang size (inch)</label>
          <input
            name="pan_size_inch"
            type="number"
            step="0.5"
            min="1"
            value={pan}
            onChange={(e) => setPan(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Cut comparison */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Cut (rows×cols)</th>
              <th>Piece size</th>
              <th className="text-right">Cost/pc</th>
              <th className="text-right">Sell/pc</th>
              <th className="text-right">Profit/loyang</th>
            </tr>
          </thead>
          <tbody>
            {cuts.map(([r, c]) => {
              const p = pricingForCut(full, r, c);
              const active = r === rows && c === cols;
              return (
                <tr
                  key={`${r}x${c}`}
                  onClick={() => pick(r, c)}
                  className={`cursor-pointer ${active ? "bg-cocoa-100 font-semibold" : "hover:bg-cocoa-50"}`}
                >
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className="whitespace-nowrap">
                        {r}×{c} <span className="text-cocoa-500">({p.pieces} pcs)</span>
                      </span>
                      <CutInfoButton rows={r} cols={c} panInch={full.panSizeInch} price={p.suggestedPrice} />
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    {inch(p.pieceWidthInch)} × {inch(p.pieceLengthInch)}
                  </td>
                  <td className="text-right">{rm(p.costPerPiece)}</td>
                  <td className="text-right text-cocoa-800">{rm(p.suggestedPrice)}</td>
                  <td className="text-right">{rm(p.profitPerLoyang)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-cocoa-500">Tap a row to pick that cut, or type any rows × columns above. Tap ⓘ to see how to cut it.</p>
      </div>

      {/* Own price check */}
      <div className="rounded-xl border border-dashed border-cocoa-300 p-4">
        <label className="label">Check your own price: what if I sell each piece at…</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            step="0.10"
            min="0"
            placeholder="e.g. 2.00"
            value={ownPrice}
            onChange={(e) => setOwnPrice(e.target.value)}
            className="input max-w-[140px]"
          />
          {hasOwn && (
            <p className="text-sm">
              Margin <b className={marginOf(own, selected.costPerPiece) < 0 ? "text-red-600" : ""}>
                {marginOf(own, selected.costPerPiece).toFixed(0)}%
              </b>{" "}
              · profit {rm(own - selected.costPerPiece)}/pc · {rm((own - selected.costPerPiece) * selected.pieces)}/loyang
            </p>
          )}
        </div>
      </div>

      {/* Persisted fields */}
      <div className="grid gap-3 border-t border-cocoa-100 pt-4 sm:grid-cols-2">
        <div>
          <label className="label">Recipe name</label>
          <input name="recipe_name" autoComplete="off" defaultValue={recipe.name} required className="input" />
        </div>
        <div>
          <label className="label">Notes</label>
          <input name="notes" autoComplete="off" defaultValue={recipe.notes ?? ""} placeholder="Optional" className="input" />
        </div>
      </div>
      <div className="flex justify-end">
        <SubmitButton>Save these settings</SubmitButton>
      </div>
    </form>
  );
}

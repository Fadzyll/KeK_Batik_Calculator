// Pure pricing maths for kek batik. No framework imports so it can be unit-tested directly.

export type CostIngredient = {
  pack_price: number;
  pack_size: number;
};

export type CostItem = {
  quantity_used: number;
  ingredient: CostIngredient;
};

export type ExtraCost = {
  amount: number;
  cost_type: "per_loyang" | "per_piece";
};

/** Cost of the portion of one ingredient used in one loyang. */
export function itemCost(item: CostItem): number {
  const { pack_price, pack_size } = item.ingredient;
  if (!pack_size || pack_size <= 0) return 0;
  return (Number(item.quantity_used) / Number(pack_size)) * Number(pack_price);
}

/** Total ingredient cost for one loyang. */
export function ingredientCostPerLoyang(items: CostItem[]): number {
  return items.reduce((sum, it) => sum + itemCost(it), 0);
}

export function extraCostTotals(extras: ExtraCost[]) {
  let perLoyang = 0;
  let perPiece = 0;
  for (const e of extras) {
    if (e.cost_type === "per_piece") perPiece += Number(e.amount);
    else perLoyang += Number(e.amount);
  }
  return { perLoyang, perPiece };
}

/** Round up to the nearest step (e.g. 0.50 → RM1.20 becomes RM1.50). Step 0 = round to sen. */
export function roundUpTo(value: number, step: number): number {
  if (!step || step <= 0) return Math.ceil(value * 100 - 1e-9) / 100;
  // Work in sen to avoid floating-point surprises.
  const sen = Math.round(step * 100);
  const valueSen = Math.ceil(value * 100 - 1e-9);
  return (Math.ceil(valueSen / sen) * sen) / 100;
}

/** Price needed to hit a profit margin (percent of selling price). */
export function priceForMargin(cost: number, marginPercent: number): number {
  const m = Math.min(Math.max(marginPercent, 0), 99.99) / 100;
  return cost / (1 - m);
}

export function marginOf(price: number, cost: number): number {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
}

export type CutOption = {
  rows: number;
  cols: number;
  pieces: number;
  pieceWidthInch: number; // across (pan width ÷ columns)
  pieceLengthInch: number; // down (pan length ÷ rows)
  costPerPiece: number;
  rawPrice: number;
  suggestedPrice: number;
  actualMargin: number;
  profitPerPiece: number;
  revenuePerLoyang: number;
  profitPerLoyang: number;
};

export type PricingInput = {
  items: CostItem[];
  extras: ExtraCost[];
  panSizeInch: number;
  targetMargin: number;
  roundingStep: number;
};

/** Price a cut of `rows` × `cols` pieces from one (square) loyang. */
export function pricingForCut(input: PricingInput, rows: number, cols: number): CutOption {
  const pieces = rows * cols;
  const ingredientCost = ingredientCostPerLoyang(input.items);
  const { perLoyang, perPiece } = extraCostTotals(input.extras);
  const costPerPiece = (ingredientCost + perLoyang) / pieces + perPiece;
  const rawPrice = priceForMargin(costPerPiece, input.targetMargin);
  const suggestedPrice = roundUpTo(rawPrice, input.roundingStep);
  const profitPerPiece = suggestedPrice - costPerPiece;
  return {
    rows,
    cols,
    pieces,
    pieceWidthInch: input.panSizeInch / cols,
    pieceLengthInch: input.panSizeInch / rows,
    costPerPiece,
    rawPrice,
    suggestedPrice,
    actualMargin: marginOf(suggestedPrice, costPerPiece),
    profitPerPiece,
    revenuePerLoyang: suggestedPrice * pieces,
    profitPerLoyang: profitPerPiece * pieces,
  };
}

/** Common ways to cut a loyang, for the comparison table (rows × columns). */
export const COMMON_CUTS: [number, number][] = [
  [2, 2], [3, 2], [4, 2], [3, 3], [4, 3], [4, 4], [5, 4], [5, 5], [6, 4], [6, 5], [6, 6], [7, 7], [8, 8],
];

export function loyangCost(items: CostItem[], extras: ExtraCost[], pieces: number): number {
  const { perLoyang, perPiece } = extraCostTotals(extras);
  return ingredientCostPerLoyang(items) + perLoyang + perPiece * pieces;
}

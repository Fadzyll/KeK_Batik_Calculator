import { test } from "node:test";
import assert from "node:assert/strict";
import {
  itemCost,
  ingredientCostPerLoyang,
  roundUpTo,
  priceForMargin,
  pricingForCut,
  loyangCost,
} from "./pricing.ts";

const milo = { pack_price: 32, pack_size: 1000 }; // RM32 / 1kg
const biscuit = { pack_price: 6, pack_size: 600 }; // Marie 600g RM6

test("itemCost uses the proportion of the pack", () => {
  assert.equal(itemCost({ quantity_used: 250, ingredient: milo }), 8);
  assert.equal(itemCost({ quantity_used: 0, ingredient: { pack_price: 5, pack_size: 0 } }), 0);
});

test("ingredientCostPerLoyang sums items", () => {
  const total = ingredientCostPerLoyang([
    { quantity_used: 250, ingredient: milo },
    { quantity_used: 300, ingredient: biscuit },
  ]);
  assert.equal(total, 11);
});

test("roundUpTo rounds up to the step", () => {
  assert.equal(roundUpTo(1.2, 0.5), 1.5);
  assert.equal(roundUpTo(1.5, 0.5), 1.5);
  assert.equal(roundUpTo(1.01, 0.1), 1.1);
  assert.equal(roundUpTo(1.234, 0), 1.24);
  assert.equal(roundUpTo(0.3, 0.1), 0.3); // no float drift to 0.4
});

test("priceForMargin", () => {
  assert.equal(priceForMargin(1, 50), 2);
  assert.ok(Math.abs(priceForMargin(0.6, 40) - 1) < 1e-9);
});

test("pricingForCut 4x4 with extras", () => {
  const r = pricingForCut(
    {
      items: [
        { quantity_used: 250, ingredient: milo },
        { quantity_used: 300, ingredient: biscuit },
      ],
      extras: [
        { amount: 5, cost_type: "per_loyang" }, // gas etc
        { amount: 0.1, cost_type: "per_piece" }, // plastic
      ],
      panSizeInch: 8,
      targetMargin: 50,
      roundingStep: 0.5,
    },
    4,
    4,
  );
  assert.equal(r.pieces, 16);
  assert.equal(r.pieceWidthInch, 2);
  assert.equal(r.costPerPiece, 1.1); // (11+5)/16 + 0.1
  assert.equal(r.suggestedPrice, 2.5); // 2.2 → 2.5
});

test("loyangCost includes per-piece extras times pieces", () => {
  assert.equal(
    loyangCost([{ quantity_used: 250, ingredient: milo }], [{ amount: 0.5, cost_type: "per_piece" }], 16),
    16,
  );
});

test("pricingForCut supports rectangles: 4 rows x 2 columns", () => {
  const r = pricingForCut(
    { items: [{ quantity_used: 1000, ingredient: milo }], extras: [], panSizeInch: 8, targetMargin: 50, roundingStep: 0.5 },
    4,
    2,
  );
  assert.equal(r.pieces, 8);
  assert.equal(r.pieceWidthInch, 4); // 8 / 2 columns
  assert.equal(r.pieceLengthInch, 2); // 8 / 4 rows
  assert.equal(r.costPerPiece, 4); // RM32 / 8
  assert.equal(r.suggestedPrice, 8);
});

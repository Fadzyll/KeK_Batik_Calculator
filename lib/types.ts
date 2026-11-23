export type Ingredient = {
  id: string;
  name: string;
  pack_price: number;
  pack_size: number;
  unit: string;
  updated_at: string;
};

export type Recipe = {
  id: string;
  name: string;
  pan_size_inch: number;
  default_grid: number;
  default_rows?: number | null;
  default_cols?: number | null;
  target_margin: number;
  rounding_step: number;
  notes: string | null;
};

export type RecipeItem = {
  id: string;
  recipe_id: string;
  quantity_used: number;
  ingredient: Ingredient;
};

export type ExtraCostRow = {
  id: string;
  recipe_id: string;
  name: string;
  amount: number;
  cost_type: "per_loyang" | "per_piece";
};

export type Expense = {
  id: string;
  expense_date: string;
  description: string;
  category: "ingredient" | "packaging" | "utilities" | "other";
  ingredient_id: string | null;
  quantity: number | null;
  amount: number;
};

export type Sale = {
  id: string;
  sale_date: string;
  recipe_id: string | null;
  customer: string | null;
  pieces: number;
  price_per_piece: number;
  total: number;
  notes: string | null;
  recipe?: { name: string } | null;
};

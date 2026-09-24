/** Static demo menu for the Menu Card page until the Phase 1-3 backend lands. */

export type DemoStation = "KITCHEN" | "BAR";

export interface DemoCategory {
  id: string;
  name: string;
}

export interface DemoMenuItem {
  id: string;
  name: string;
  description: string;
  /** Price in integer paise (never floats). */
  pricePaise: number;
  categoryId: string;
  station: DemoStation;
  veg: boolean;
  tags: string[];
  available: boolean;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains" },
  { id: "desserts", name: "Desserts" },
  { id: "soft-drinks", name: "Soft Drinks" },
  { id: "cocktails", name: "Cocktails" },
];

export const DEMO_ITEMS: DemoMenuItem[] = [
  {
    id: "paneer-tikka",
    name: "Paneer Tikka",
    description: "Smoked cottage cheese, peppers, mint chutney.",
    pricePaise: 24900,
    categoryId: "starters",
    station: "KITCHEN",
    veg: true,
    tags: ["spicy"],
    available: true,
  },
  {
    id: "chicken-65",
    name: "Chicken 65",
    description: "Fiery deep-fried chicken, curry leaves, lemon.",
    pricePaise: 27900,
    categoryId: "starters",
    station: "KITCHEN",
    veg: false,
    tags: ["spicy", "non-veg"],
    available: true,
  },
  {
    id: "masala-fries",
    name: "Masala Fries",
    description: "Crispy fries dusted with house masala.",
    pricePaise: 14900,
    categoryId: "starters",
    station: "KITCHEN",
    veg: true,
    tags: ["veg"],
    available: true,
  },
  {
    id: "butter-chicken",
    name: "Butter Chicken",
    description: "Tandoori chicken folded into tomato-fenugreek gravy.",
    pricePaise: 32900,
    categoryId: "mains",
    station: "KITCHEN",
    veg: false,
    tags: ["non-veg", "contains-dairy"],
    available: true,
  },
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description: "Cottage cheese in a rich tomato-cashew gravy.",
    pricePaise: 28900,
    categoryId: "mains",
    station: "KITCHEN",
    veg: true,
    tags: ["veg", "contains-dairy", "contains-nuts"],
    available: true,
  },
  {
    id: "chicken-biryani",
    name: "Chicken Dum Biryani",
    description: "Sealed pot biryani, saffron rice, mirchi ka salan.",
    pricePaise: 29900,
    categoryId: "mains",
    station: "KITCHEN",
    veg: false,
    tags: ["non-veg", "spicy"],
    available: false,
  },
  {
    id: "garlic-naan",
    name: "Garlic Naan",
    description: "Tandoor-flatbread, garlic butter, coriander.",
    pricePaise: 7900,
    categoryId: "mains",
    station: "KITCHEN",
    veg: true,
    tags: ["veg", "contains-gluten", "contains-dairy"],
    available: true,
  },
  {
    id: "gulab-jamun",
    name: "Gulab Jamun (2 pc)",
    description: "Warm milk dumplings in rose-cardamom syrup.",
    pricePaise: 9900,
    categoryId: "desserts",
    station: "KITCHEN",
    veg: true,
    tags: ["veg", "contains-dairy"],
    available: true,
  },
  {
    id: "kulfi-falooda",
    name: "Kulfi Falooda",
    description: "Dense kulfi, vermicelli, basil seeds, rose syrup.",
    pricePaise: 14900,
    categoryId: "desserts",
    station: "KITCHEN",
    veg: true,
    tags: ["veg", "contains-dairy"],
    available: true,
  },
  {
    id: "mango-lassi",
    name: "Mango Lassi",
    description: "Alphonso pulp churned with creamy curd.",
    pricePaise: 12900,
    categoryId: "soft-drinks",
    station: "BAR",
    veg: true,
    tags: ["veg", "contains-dairy"],
    available: true,
  },
  {
    id: "masala-shikanji",
    name: "Masala Shikanji",
    description: "Spiced lemonade, black salt, roasted cumin.",
    pricePaise: 8900,
    categoryId: "soft-drinks",
    station: "BAR",
    veg: true,
    tags: ["veg"],
    available: true,
  },
  {
    id: "virgin-mojito",
    name: "Virgin Mint Mojito",
    description: "Muddled mint, lime, soda over crushed ice.",
    pricePaise: 13900,
    categoryId: "cocktails",
    station: "BAR",
    veg: true,
    tags: ["veg", "no-ice-option"],
    available: true,
  },
  {
    id: "blue-lagoon",
    name: "Blue Lagoon Cooler",
    description: "Citrus-blue curacao syrup, lemonade, soda.",
    pricePaise: 15900,
    categoryId: "cocktails",
    station: "BAR",
    veg: true,
    tags: ["veg"],
    available: true,
  },
];

/** Demo table label for the sample token used on the home page. */
export function demoTableLabel(token: string | undefined): string {
  if (token === "demo-table-7") return "Table 7";
  return token ? `Table · ${token}` : "Table";
}

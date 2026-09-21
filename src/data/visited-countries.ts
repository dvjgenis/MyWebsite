export type VisitedRegion = "Americas" | "Europe" | "Africa" | "Asia";

export interface VisitedCountry {
  id: string;
  name: string;
  region: VisitedRegion;
}

export const visitedCountries: VisitedCountry[] = [
  { id: "608", name: "Philippines", region: "Asia" },
  { id: "840", name: "United States", region: "Americas" },
  { id: "124", name: "Canada", region: "Americas" },
  { id: "192", name: "Cuba", region: "Americas" },
  { id: "188", name: "Costa Rica", region: "Americas" },
  { id: "724", name: "Spain", region: "Europe" },
  { id: "504", name: "Morocco", region: "Africa" },
  { id: "250", name: "France", region: "Europe" },
  { id: "276", name: "Germany", region: "Europe" },
  { id: "826", name: "England", region: "Europe" },
  { id: "756", name: "Switzerland", region: "Europe" },
  { id: "616", name: "Poland", region: "Europe" },
  { id: "040", name: "Austria", region: "Europe" },
  { id: "752", name: "Sweden", region: "Europe" },
  { id: "634", name: "Qatar", region: "Asia" },
  { id: "784", name: "UAE", region: "Asia" },
];

export const visitedById = new Map(visitedCountries.map((country) => [country.id, country]));

const regionOrder: VisitedRegion[] = ["Americas", "Europe", "Africa", "Asia"];

export const visitedRegions = regionOrder.map((region) => ({
  region,
  items: visitedCountries.filter((country) => country.region === region),
}));

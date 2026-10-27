export type ItineraryDay = { day: number; title: string; detail: string };

export type Trip = {
  id: string;
  code: string;
  title: string;
  destination: string;
  summary: string;
  duration: string;
  grades: string;
  season: string;
  price_from_inr: number;
  places: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  sort_order: number;
};

export const TRIP_COLUMNS =
  "id, code, title, destination, summary, duration, grades, season, price_from_inr, places, itinerary, inclusions, sort_order";

// Accent per trip, used in the admin share bar and tags.
export const TRIP_COLORS: Record<string, string> = {
  SIN: "#12A594",
  JAI: "#D9573F",
  LHR: "#4A63C9",
};

export const tripColor = (code: string) => TRIP_COLORS[code] ?? "#5B6785";

export const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

// "6 days · 5 nights" → "6D/5N" for the compact pass layout.
export const shortDuration = (duration: string) =>
  duration.replace(/(\d+) days? · (\d+) nights?/, "$1D/$2N");

// Short, human-friendly reference shown to the teacher and in the admin table.
export const toReference = (code: string, id: string) => `STI-${code}-${id.slice(0, 6).toUpperCase()}`;

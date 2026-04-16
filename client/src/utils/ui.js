// utils/ui.js — shared design tokens & helper components
// Import this wherever you need shared styles

export const cls = (...classes) => classes.filter(Boolean).join(" ");

// Status config
export const STATUS = {
  ongoing:  { label: "Live Now",  dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20", pulse: true },
  upcoming: { label: "Upcoming",  dot: "bg-sky-400",     badge: "bg-sky-400/10 text-sky-400 border border-sky-400/20",           pulse: false },
  past:     { label: "Ended",     dot: "bg-zinc-500",    badge: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",         pulse: false },
};

export const PRICE_COLOR = (price) =>
  price === 0 ? "text-emerald-400" : "text-amber-400";

export const PRICE_LABEL = (price) =>
  price === 0 ? "Free" : `₦${Number(price).toLocaleString()}`;

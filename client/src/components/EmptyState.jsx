import { btnPrimary } from "../utils/design";

export default function EmptyState({ icon, title, description, cta, to }) {
  const Link = window.Link || function({ to, children }) { return <a href={to}>{children}</a> };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
      <p className="text-5xl mb-4">{icon || "📦"}</p>
      <p className="font-black text-white text-xl mb-2">{title}</p>
      {description && <p className="text-zinc-600 text-sm mb-6">{description}</p>}
      {cta && (
        <a href={to || "#"} className={btnPrimary}>{cta}</a>
      )}
    </div>
  );
}

export default function SectionHeader({ eyebrow, title, description, accent }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className={"text-[10px] tracking-[0.35em] uppercase font-bold mb-2 " + (accent === "amber" ? "text-amber-400" : "text-zinc-500")}>{eyebrow}</p>}
      {title && (typeof title === "string" ? <h1 className="text-4xl font-black">{title}</h1> : title)}
      {description && <p className="text-zinc-600 text-sm mt-1">{description}</p>}
    </div>
  );
}

import { useState } from "react";

export default function EmbeddedMap({ venue, location }) {
  const [expanded, setExpanded] = useState(false);
  const query = venue?.lat && venue?.lng
    ? `${venue.lat},${venue.lng}`
    : encodeURIComponent(venue?.address || location || "");

  return (
    <div className="mb-8">
      <p className="text-[10px] tracking-widest uppercase text-amber-400 font-bold mb-3">Location</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className={`relative ${expanded ? "h-96" : "h-48"} transition-all duration-500`}>
          <iframe
            title="Event Location"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&q=${query}&center=${query}&zoom=15`}
          />
        </div>
        <div className="p-4 flex items-center justify-between">
          <p className="text-zinc-400 text-sm">{venue?.address || location}</p>
          <div className="flex gap-2">
            <button onClick={() => setExpanded(e => !e)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
              {expanded ? "Collapse" : "Expand"}
            </button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${query}`} target="_blank" rel="noopener noreferrer"
              className="text-xs font-bold bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl hover:bg-amber-300 transition-all">
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

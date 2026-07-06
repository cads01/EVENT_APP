import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS = [
  { icon: "👔", label: "Dress Code", key: "dressCode" },
  { icon: "👜", label: "Bag Policy", key: "bagPolicy" },
  { icon: "🎯", label: "Amenities", key: "amenities" },
  { icon: "📍", label: "Venue", key: "location" },
];

export default function KnowBeforeYouGo({ event }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const cards = ITEMS.map(item => {
    let value;
    if (item.key === "amenities") {
      value = event.amenities?.length ? event.amenities.join(" · ") : "Standard amenities available";
    } else if (item.key === "location") {
      value = event.location;
    } else {
      value = event[item.key] || "Information coming soon";
    }
    return { ...item, value };
  });

  const paginate = (dir) => {
    setDirection(dir);
    setCurrent(c => (c + dir + cards.length) % cards.length);
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, rotate: dir > 0 ? 12 : -12 }),
    center: { x: 0, opacity: 1, rotate: 0 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, rotate: dir > 0 ? -12 : 12 }),
  };

  if (!cards.length) return null;

  const card = cards[current];

  return (
    <div className="mb-8">
      <p className="text-[10px] tracking-widest uppercase text-amber-400 font-bold mb-4">Know Before You Go</p>
      <div className="relative h-56">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80) paginate(-1);
              else if (info.offset.x < -80) paginate(1);
            }}
          >
            <div>
              <span className="text-4xl mb-3 block">{card.icon}</span>
              <h3 className="text-lg font-black text-white mb-1">{card.label}</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">{card.value}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <button onClick={() => paginate(-1)}
          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center text-sm">‹</button>
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-amber-400 w-5" : "bg-zinc-700"}`} />
          ))}
        </div>
        <button onClick={() => paginate(1)}
          className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center text-sm">›</button>
      </div>
      <p className="text-center text-[10px] text-zinc-600 mt-2">Swipe or use arrows · {current + 1} of {cards.length}</p>
    </div>
  );
}

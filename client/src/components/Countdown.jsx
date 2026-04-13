// components/Countdown.jsx
import { useState, useEffect } from "react";

const pad = (n) => String(n).padStart(2, "0");

export default function Countdown({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(eventDate) - new Date();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (expired) {
    return (
      <div className="text-center py-6">
        <span className="text-yellow-400 font-bold text-lg tracking-widest uppercase font-mono">
          🎉 This event is happening now!
        </span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: pad(timeLeft.hours) },
    { label: "Mins", value: pad(timeLeft.minutes) },
    { label: "Secs", value: pad(timeLeft.seconds) },
  ];

  return (
    <div className="w-full">
      <p className="text-xs font-mono tracking-widest uppercase text-gray-500 mb-3 text-center">
        Starts in
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center bg-black/40 border border-white/10 rounded-lg py-3 px-2"
          >
            <span className="text-3xl font-extrabold text-yellow-400 leading-none tracking-tight">
              {value}
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mt-1">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

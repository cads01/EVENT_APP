// components/Countdown.jsx
import { useState, useEffect } from "react";

const pad = (n) => String(n).padStart(2, "0");

const isSameCalendarDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export default function Countdown({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState("upcoming");

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const event = new Date(eventDate);
      const diff = event - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
        setStatus("upcoming");
        return;
      }

      setTimeLeft(null);
      setStatus(isSameCalendarDay(event, now) ? "ongoing" : "past");
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (status === "ongoing") {
    return (
      <div className="text-center py-6">
        <span className="text-yellow-400 font-bold text-lg tracking-widest uppercase font-mono">
          🎉 This event is happening now!
        </span>
      </div>
    );
  }

  if (status === "past") {
    return (
      <div className="text-center py-6">
        <span className="text-gray-500 font-bold text-lg tracking-widest uppercase font-mono">
          ⏳ This event has already ended.
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

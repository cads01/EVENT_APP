// components/GetDirections.jsx
import { useState } from "react";

export default function GetDirections({ venue, location }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Build destination string for Google Maps
  const getDestination = () => {
    if (venue?.lat && venue?.lng) return `${venue.lat},${venue.lng}`;
    return encodeURIComponent(venue?.address || location);
  };

  const openDirections = () => {
    setError("");
    setLoading(true);

    // Try to get the user's current location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          const { latitude, longitude } = pos.coords;
          const destination = getDestination();
          // Google Maps directions with live origin
          const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${destination}`;
          window.open(url, "_blank");
        },
        (err) => {
          setLoading(false);
          // Geolocation denied or failed — open Maps without origin, let Google handle it
          console.warn("Geolocation failed:", err.message);
          const destination = getDestination();
          const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
          window.open(url, "_blank");
        },
        { timeout: 6000 }
      );
    } else {
      // Browser doesn't support geolocation
      setLoading(false);
      const destination = getDestination();
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={openDirections}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-mono text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="animate-spin text-base">⟳</span>
            Getting your location...
          </>
        ) : (
          <>
            📍 Get Directions
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs font-mono text-center">{error}</p>
      )}
      <p className="text-gray-600 text-[10px] font-mono text-center tracking-wide">
        Opens Google Maps · uses your current location
      </p>
    </div>
  );
}

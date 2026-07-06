import { useState, useEffect, useRef } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckInScanner({ eventId }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    API.get(`/checkin/${eventId}/stats`).then(res => setStats(res.data)).catch(() => {});
  }, [eventId]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startScan = async () => {
    setScanning(true);
    setError("");
    setResult(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      scannerRef.current = new Html5Qrcode("scanner-view");
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scannerRef.current.stop();
          setScanning(false);
          handleCheckin(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError("Camera access denied or not available");
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (scannerRef.current) {
      try { scannerRef.current.stop(); } catch {}
    }
    setScanning(false);
  };

  const handleCheckin = async (code) => {
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/checkin/scan", { ticketCode: code, eventId });
      setResult(res.data);
      API.get(`/checkin/${eventId}/stats`).then(s => setStats(s.data)).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally { setLoading(false); }
  };

  const manualCheckin = () => {
    if (!manualCode.trim()) return;
    handleCheckin(manualCode.trim().toUpperCase());
    setManualCode("");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-emerald-400 font-bold">Gate Control</p>
          <h3 className="text-xl font-black text-white mt-1">Check-In Scanner</h3>
        </div>
        {stats && (
          <div className="flex gap-3">
            <div className="text-center bg-zinc-800 rounded-xl px-4 py-2">
              <p className="text-lg font-black text-white">{stats.checkedIn}</p>
              <p className="text-[9px] text-zinc-500 tracking-widest uppercase">Checked In</p>
            </div>
            <div className="text-center bg-zinc-800 rounded-xl px-4 py-2">
              <p className="text-lg font-black text-white">{stats.totalTickets}</p>
              <p className="text-[9px] text-zinc-500 tracking-widest uppercase">Total</p>
            </div>
            <div className="text-center bg-zinc-800 rounded-xl px-4 py-2">
              <p className="text-lg font-black text-amber-400">{stats.fillRate || 0}%</p>
              <p className="text-[9px] text-zinc-500 tracking-widest uppercase">Fill Rate</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={scanning ? stopScan : startScan}
            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
              scanning
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-amber-400 text-zinc-950 hover:bg-amber-300"
            }`}>
            {scanning ? "⏹ Stop Scanner" : "📷 Scan QR Code"}
          </button>
        </div>

        {scanning && (
          <div id="scanner-view" ref={videoRef}
            className="w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-black" />
        )}

        <div className="flex gap-2">
          <input value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())}
            placeholder="Or enter ticket code manually (e.g. TKT-XXXXX)"
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm" />
          <button onClick={manualCheckin} disabled={loading || !manualCode.trim()}
            className="bg-zinc-700 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-zinc-600 transition-all disabled:opacity-40">
            Verify
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-2xl">✓</div>
              <div>
                <p className="font-black text-emerald-400 text-lg">Check-In Successful</p>
                <p className="text-zinc-400 text-sm">{result.user?.name}</p>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl px-4 py-2 font-mono text-xs text-zinc-500">
              Ticket: {result.ticketCode}
            </div>
            <button onClick={() => setResult(null)}
              className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

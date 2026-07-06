import { useParams } from "react-router-dom";
import CheckInScanner from "../components/CheckInScanner";

export default function CheckInPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 pb-16 px-5" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <CheckInScanner eventId={id} />
      </div>
    </div>
  );
}

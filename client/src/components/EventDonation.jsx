import { useState } from "react";
import { API } from "../api";

export default function EventDonation({ eventId, user, currentDonations = 0, onDonation }) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState(500);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);

  const handleDonate = async () => {
    if (!user) {
      setMessage("Please sign in to donate");
      return;
    }
    if (amount <= 0) {
      setMessage("Invalid amount");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`/events/${eventId}/donate`, {
        amount,
        message: `Donated ₦${amount}`
      });

      // Open Paystack payment
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amount * 100,
        currency: "NGN",
        callback: async () => {
          // Confirm donation
          await API.post(
            `/events/${eventId}/donations/${res.data._id}/confirm`,
            { transactionRef: `donation-${Date.now()}` }
          );
          setMessage("Thank you for donating! 🙏");
          setAmount(500);
          setShowForm(false);
          onDonation?.();
          setTimeout(() => setMessage(""), 3000);
        },
        onClose: () => setMessage("Payment cancelled"),
      });
      handler.openIframe();
    } catch (err) {
      setMessage("Failed to process donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-green-900">💚 Support This Event</h2>
          <p className="text-green-700 text-sm">Total raised: ₦{currentDonations.toLocaleString()}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Donate Now
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-green-200">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes("Thank") 
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {message}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Donation Amount (₦)
            </label>
            <div className="flex gap-3 mb-4">
              {[500, 1000, 2500, 5000].map(preset => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    amount === preset
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ₦{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDonate}
              disabled={loading || amount <= 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-bold"
            >
              {loading ? "Processing..." : `Donate ₦${amount.toLocaleString()}`}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

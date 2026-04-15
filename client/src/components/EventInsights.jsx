export default function EventInsights({ event }) {
  const stats = [
    { label: "Attendees", value: event.attendees?.length || 0, icon: "👥", color: "bg-blue-100 text-blue-600" },
    { label: "Photos Shared", value: event.posts || 0, icon: "📸", color: "bg-purple-100 text-purple-600" },
    { label: "Donations", value: `₦${(event.donations || 0).toLocaleString()}`, icon: "💚", color: "bg-green-100 text-green-600" },
    { label: "Comments", value: event.comments?.length || 0, icon: "💬", color: "bg-yellow-100 text-yellow-600" },
  ];

  const capacity = event.capacity || 100;
  const attendance = event.attendees?.length || 0;
  const capacityPercent = Math.min((attendance / capacity) * 100, 100);

  return (
    <div className="mb-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">📊 Event Insights</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-xl ${stat.color}`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-sm opacity-75 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-gray-900">Event Capacity</p>
          <p className="text-sm text-gray-600">{attendance} / {capacity} spots</p>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {capacityPercent === 100 
            ? "🔴 Event is at full capacity!" 
            : `${Math.round(100 - capacityPercent)}% capacity remaining`}
        </p>
      </div>

      {/* Engagement metrics */}
      <div className="mt-8 pt-8 border-t">
        <p className="text-sm font-semibold text-gray-700 mb-4">Community Engagement</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Photo Activity</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(event.posts || 0, 10) }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-purple-500 rounded-full" />
              ))}
              {event.posts === 0 && <span className="text-xs text-gray-400">No posts yet</span>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Comment Activity</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(event.comments?.length || 0, 10) }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-yellow-500 rounded-full" />
              ))}
              {(event.comments?.length || 0) === 0 && <span className="text-xs text-gray-400">No comments yet</span>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Donations</span>
            <span className="text-sm font-semibold text-green-600">
              ₦{(event.donations || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

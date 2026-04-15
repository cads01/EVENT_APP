import { useState } from "react";
import { API } from "../api";

export default function EventComments({ eventId, user, comments = [] }) {
  const [commentText, setCommentText] = useState("");
  const [allComments, setAllComments] = useState(comments);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitComment = async () => {
    if (!user) {
      setMessage("Please sign in to comment");
      return;
    }
    if (!commentText.trim()) {
      setMessage("Comment cannot be empty");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post(`/api/events/${eventId}/comment`, { text: commentText });
      setAllComments(res.data.comments);
      setCommentText("");
      setMessage("");
    } catch (err) {
      setMessage("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 Comments ({allComments.length})</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes("Failed") || message.includes("sign in")
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-green-50 text-green-600 border border-green-200"
        }`}>
          {message}
        </div>
      )}

      {/* Add comment */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        {user ? (
          <>
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 flex-shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this event..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
              />
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={loading || !commentText.trim()}
              className="ml-auto block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </>
        ) : (
          <p className="text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </a>
            {" "}to join the conversation
          </p>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {allComments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
        ) : (
          allComments.map((comment, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 flex-shrink-0">
                  {comment.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{comment.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-700 mt-1">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

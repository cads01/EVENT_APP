import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  const isAuthor = blog?.author?._id === user?._id;

  useEffect(() => {
    API.get(`/blogs/${id}`)
      .then(res => setBlog(res.data))
      .catch(err => setMessage("Blog not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setLiking(true);
      const res = await API.post(`/blogs/${id}/like`);
      setBlog(res.data);
    } catch (err) {
      setMessage("Failed to like blog");
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) {
      setMessage("Comment cannot be empty");
      return;
    }
    try {
      setSubmittingComment(true);
      const res = await API.post(`/blogs/${id}/comment`, { text: commentText });
      setBlog(res.data);
      setCommentText("");
      setMessage("Comment added!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      navigate("/");
    } catch (err) {
      setMessage("Failed to delete blog");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading blog...</p>
      </div>
    </div>
  );

  if (!blog || message === "Blog not found") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">📰</p>
        <p className="text-gray-700 text-lg">Blog not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          ← Back to Events
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Blog card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero image */}
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-96 object-cover"
            />
          )}

          {/* Content */}
          <div className="p-8">
            {/* Meta info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                {blog.author?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{blog.author?.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(blog.createdAt).toLocaleDateString()} at {new Date(blog.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="ml-auto px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Event link */}
            {blog.event && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  📌 About event: <Link to={`/events/${blog.event._id}`} className="font-semibold hover:underline">
                    {blog.event.title}
                  </Link>
                </p>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

            {/* Content */}
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </p>
            </div>

            {/* Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes("Failed") 
                  ? "bg-red-50 text-red-600 border border-red-200" 
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}>
                {message}
              </div>
            )}

            {/* Interactions */}
            <div className="border-t pt-6 mb-8">
              <button
                onClick={handleLike}
                disabled={liking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
              >
                ❤️ {blog.likes} Likes
              </button>
              <span className="ml-6 text-gray-600">
                💬 {blog.comments?.length || 0} Comments
              </span>
            </div>

            {/* Comments section */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

              {/* Add comment */}
              {user ? (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={handleComment}
                    disabled={submittingComment || !commentText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-blue-50 rounded-xl text-center">
                  <p className="text-gray-700 mb-4">Sign in to comment</p>
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Log in
                  </Link>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-4">
                {blog.comments && blog.comments.length > 0 ? (
                  blog.comments.map((comment, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                          {comment.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {comment.user?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

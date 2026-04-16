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
      .catch(() => setMessage("Blog not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      setLiking(true);
      const res = await API.post(`/blogs/${id}/like`);
      setBlog(res.data);
    } catch { setMessage("Failed to like"); }
    finally { setLiking(false); }
  };

  const handleComment = async () => {
    if (!user) { navigate("/login"); return; }
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await API.post(`/blogs/${id}/comment`, { text: commentText });
      setBlog(res.data);
      setCommentText("");
      setMessage("Comment added!");
      setTimeout(() => setMessage(""), 3000);
    } catch { setMessage("Failed to add comment"); }
    finally { setSubmittingComment(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      navigate("/");
    } catch { setMessage("Failed to delete"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );

  if (!blog || message === "Blog not found") return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-5xl mb-4">📰</p>
        <p className="text-zinc-400">Blog not found</p>
        <Link to="/" className="text-amber-400 hover:text-amber-300 mt-4 inline-block text-sm">← Back to Events</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Hero image */}
      {blog.image && (
        <div className="relative h-72 md:h-[420px] overflow-hidden">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 py-10">
        <button onClick={() => navigate(-1)} className="text-zinc-600 hover:text-zinc-400 text-sm mb-6 block transition-colors">← Back</button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-8">
            {/* Author */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-base">
                  {blog.author?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-white text-sm">{blog.author?.name}</p>
                  <p className="text-zinc-600 text-xs">
                    {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              {isAuthor && (
                <button onClick={handleDelete}
                  className="text-xs text-red-500 border border-red-500/25 bg-red-500/5 px-4 py-2 rounded-xl hover:bg-red-500/10 font-bold transition-all">
                  Delete
                </button>
              )}
            </div>

            {/* Event link */}
            {blog.event && (
              <div className="mb-6 p-4 bg-amber-400/5 border border-amber-400/15 rounded-2xl">
                <p className="text-sm text-amber-400">
                  📌 About: <Link to={`/events/${blog.event._id}`} className="font-black hover:underline">{blog.event.title}</Link>
                </p>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-black mb-6 leading-tight">{blog.title}</h1>

            {/* Content */}
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap text-base mb-8">{blog.content}</p>

            {/* Message */}
            {message && message !== "Blog not found" && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm border ${
                message.includes("Failed") || message.includes("Error")
                  ? "bg-red-500/10 border-red-500/25 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              }`}>{message}</div>
            )}

            {/* Interactions */}
            <div className="flex items-center gap-6 border-t border-zinc-800 pt-6 mb-8">
              <button onClick={handleLike} disabled={liking}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40">
                ❤️ <span>{blog.likes}</span> <span className="text-zinc-500">Likes</span>
              </button>
              <span className="text-sm text-zinc-600">
                💬 {blog.comments?.length || 0} Comments
              </span>
            </div>

            {/* Comments */}
            <div className="border-t border-zinc-800 pt-8">
              <h2 className="font-black text-xl mb-6">Comments</h2>

              {user ? (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-5 mb-6">
                  <div className="flex gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-sm flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder="Share your thoughts…"
                      className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 p-3 rounded-xl text-sm focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                      rows={3} />
                  </div>
                  <button onClick={handleComment} disabled={submittingComment || !commentText.trim()}
                    className="px-5 py-2 bg-amber-400 text-zinc-950 rounded-xl text-sm font-black hover:bg-amber-300 transition-all disabled:opacity-40">
                    {submittingComment ? "Posting…" : "Post Comment"}
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 text-center mb-6">
                  <p className="text-zinc-500 text-sm mb-3">Sign in to comment</p>
                  <Link to="/login" className="text-amber-400 hover:text-amber-300 font-black text-sm transition-colors">Log in →</Link>
                </div>
              )}

              <div className="space-y-3">
                {blog.comments?.length > 0 ? blog.comments.map((c, i) => (
                  <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white font-black text-xs">
                        {c.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{c.user?.name || "Anonymous"}</p>
                        <p className="text-zinc-600 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm pl-11">{c.text}</p>
                  </div>
                )) : (
                  <p className="text-center text-zinc-600 py-8 text-xs tracking-widest uppercase">No comments yet. Be first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

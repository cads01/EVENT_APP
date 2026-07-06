import { useEffect, useState } from "react";
import { API } from "../api";
import { motion, AnimatePresence } from "framer-motion";

export default function EventForum({ eventId, user }) {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchThreads = () => {
    API.get(`/forum/${eventId}/threads`).then(res => setThreads(res.data)).catch(() => {});
  };

  useEffect(() => { fetchThreads(); }, [eventId]);

  const fetchPosts = (threadId) => {
    setActiveThread(threadId);
    API.get(`/forum/${eventId}/threads/${threadId}/posts`).then(res => setPosts(res.data)).catch(() => {});
  };

  const createThread = async () => {
    if (!newTitle.trim()) return;
    try {
      setLoading(true);
      await API.post(`/forum/${eventId}/threads`, { title: newTitle });
      setNewTitle("");
      setShowNewThread(false);
      fetchThreads();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const createPost = async () => {
    if (!newContent.trim() || !activeThread) return;
    try {
      setLoading(true);
      await API.post(`/forum/${eventId}/threads/${activeThread}/posts`, { content: newContent });
      setNewContent("");
      fetchPosts(activeThread);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const upvote = async (postId) => {
    try {
      const res = await API.post(`/forum/${eventId}/posts/${postId}/upvote`);
      setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
    } catch {}
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] tracking-widest uppercase text-sky-400 font-bold">Discussion Forum</p>
        {user && !activeThread && (
          <button onClick={() => setShowNewThread(v => !v)}
            className="text-xs font-bold text-amber-400 border border-amber-400/25 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 transition-all">
            {showNewThread ? "Cancel" : "+ New Thread"}
          </button>
        )}
      </div>

      {showNewThread && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Thread title"
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm" />
          <button onClick={createThread} disabled={loading || !newTitle.trim()}
            className="bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-300 transition-all disabled:opacity-40">
            Create Thread
          </button>
        </motion.div>
      )}

      {activeThread ? (
        <div>
          <button onClick={() => { setActiveThread(null); setPosts([]); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">← Back to threads</button>
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            <AnimatePresence>
              {posts.map(p => (
                <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                      {p.author?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm">{p.author?.name}</p>
                        <span className="text-zinc-600 text-[10px]">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-400 text-sm">{p.content}</p>
                      <button onClick={() => upvote(p._id)}
                        className="mt-2 text-xs text-zinc-600 hover:text-sky-400 transition-colors flex items-center gap-1">
                        ▲ {p.upvotes?.length || 0}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {user && (
            <div className="flex gap-2">
              <input value={newContent} onChange={e => setNewContent(e.target.value)}
                placeholder="Write a reply..." className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-3 py-2 text-sm" />
              <button onClick={createPost} disabled={loading || !newContent.trim()}
                className="bg-sky-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-300 transition-all disabled:opacity-40">
                Post
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {threads.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-8 tracking-widest uppercase">No discussions yet</p>
          ) : threads.map(t => (
            <motion.button key={t._id} whileHover={{ scale: 1.01 }} onClick={() => fetchPosts(t._id)}
              className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3">
                {t.pinned && <span className="text-[10px] text-amber-400 font-bold">📌</span>}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{t.title}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{t.author?.name} · {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-zinc-600 text-xs">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

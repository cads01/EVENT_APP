import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import { optimizeCloudinary } from "../utils/images";

export default function BlogCarousel() {
  var [blogs, setBlogs] = useState([]);
  var [loading, setLoading] = useState(true);
  var rowRef = useRef(null);

  useEffect(function() {
    API.get("/blogs").then(function(res) {
      setBlogs(res.data || []);
    }).catch(function() {}).finally(function() { setLoading(false) });
  }, []);

  var scroll = function(dir) {
    rowRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (loading) return null;
  if (blogs.length === 0) return null;

  return (
    <div className="px-5 md:px-10 mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-amber-400 font-bold mb-1">Stories</p>
          <h2 className="text-white font-black text-lg">From the Blog</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={function() { scroll(-1) }}
            className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center">‹</button>
          <button onClick={function() { scroll(1) }}
            className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center">›</button>
        </div>
      </div>

      <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {blogs.map(function(blog) {
          return (
            <Link key={blog._id} to={"/blog/" + blog._id}
              className="flex-shrink-0 w-72 group">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300">
                {blog.image ? (
                  <div className="h-40 overflow-hidden bg-zinc-800">
                    <img src={optimizeCloudinary(blog.image, 400)} alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-4xl bg-gradient-to-br from-zinc-800 to-zinc-900">📝</div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center text-[10px] font-black text-amber-400">
                      {blog.author?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="text-[11px]">
                      <p className="text-zinc-300 font-semibold leading-tight">{blog.author?.name || "Anonymous"}</p>
                      <p className="text-zinc-600">{new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <h3 className="font-black text-white text-sm leading-tight line-clamp-2 mb-2">{blog.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-3">{blog.content}</p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                    <span>❤️ {blog.likes || 0}</span>
                    <span>💬 {blog.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

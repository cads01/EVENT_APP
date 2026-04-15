import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function BlogCarousel({ blogs = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (blogs.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(blogs.length / 3));
    }, 6000);
    return () => clearInterval(interval);
  }, [blogs.length]);

  if (blogs.length === 0) return null;

  const itemsPerPage = 3;
  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const startIdx = currentIndex * itemsPerPage;
  const visibleBlogs = blogs.slice(startIdx, startIdx + itemsPerPage);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  return (
    <div className="relative w-full">
      {/* Blog cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {visibleBlogs.map((blog) => (
          <div
            key={blog._id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            {/* Blog image */}
            {blog.image && (
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-40 object-cover"
              />
            )}

            {/* Blog content */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  {blog.author?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-semibold">{blog.author?.name || "Anonymous"}</p>
                  <p className="text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                {blog.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {blog.content}
              </p>

              {blog.event && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-3">
                  About: {blog.event?.title}
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <button className="flex items-center gap-1 hover:text-red-500 transition">
                  ❤️ {blog.likes}
                </button>
                <span className="flex items-center gap-1">
                  💬 {blog.comments?.length || 0}
                </span>
              </div>

              <Link
                to={`/blog/${blog._id}`}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Read More →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <>
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={goToPrevious}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition font-bold"
            >
              ‹
            </button>
            <div className="flex gap-2 items-center">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentIndex ? "bg-blue-600 w-6" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition font-bold"
            >
              ›
            </button>
          </div>
          <p className="text-center text-sm text-gray-500">
            {currentIndex + 1} / {totalPages}
          </p>
        </>
      )}
    </div>
  );
}

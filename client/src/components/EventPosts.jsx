import { useEffect, useState } from "react";
import { API } from "../api";

export default function EventPosts({ eventId, user, isAttending = false, canPost = false, onPostsChange }) {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeImage = (idx) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!user) {
      setMessage("Please sign in to post");
      return;
    }
    if (!isAttending) {
      setMessage("Only RSVP'd attendees can share picture posts.");
      return;
    }
    if (!canPost) {
      setMessage("Only checked-in attendees or events that have already started can share picture posts.");
      return;
    }
    if (selectedImages.length === 0) {
      setMessage("Please select at least one image");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      selectedImages.forEach(img => formData.append("images", img));
      formData.append("caption", caption);

      await API.post(`/api/events/${eventId}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSelectedImages([]);
      setImagePreviews([]);
      setCaption("");
      setShowForm(false);
      setMessage("Your photos have been submitted and are pending moderator approval.");
      onPostsChange?.();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (postId) => {
    if (!user) {
      setMessage("Please sign in to report a post.");
      return;
    }

    const reason = window.prompt("Why are you reporting this post? (spam, offensive, inappropriate, etc.)");
    if (!reason) return;

    try {
      await API.post(`/api/events/${eventId}/posts/${postId}/report`, { reason });
      setMessage("Report submitted. Moderators will review this post.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit report");
    }
  };

  useEffect(() => {
    API.get(`/api/events/${eventId}/posts`)
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]));
  }, [eventId]);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📸 Event Gallery ({posts.length})</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes("Failed") || message.includes("sign in") || message.includes("RSVP")
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-green-50 text-green-600 border border-green-200"
        }`}>
          {message}
        </div>
      )}

      {/* Post permission */}
      {!user ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700">
          Please log in to view or share photos.
        </div>
      ) : !isAttending ? (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-700">
          Only RSVP'd attendees can share picture posts. RSVP now to join the gallery.
        </div>
      ) : !canPost ? (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-700">
          Check in before the event starts to share photos early.
        </div>
      ) : null}

      {/* Post form */}
      {!showForm && isAttending && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 p-4 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition text-blue-600 font-semibold"
        >
          + Share Photos from this Event
        </button>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Share Your Moments</h3>

          {/* Image uploads */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images (up to 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              disabled={selectedImages.length >= 5}
              className="w-full p-3 border border-gray-200 rounded-lg disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedImages.length} / 5 images selected
            </p>
          </div>

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Caption */}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a caption (optional)..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            rows="2"
          />

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || selectedImages.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? "Uploading..." : "Post"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedImages([]);
                setImagePreviews([]);
                setCaption("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 col-span-2 py-12">No posts yet. Share your moments!</p>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              {/* Images carousel */}
              <div className="bg-black h-64 overflow-hidden flex items-center justify-center">
                {post.images?.[0] && (
                  <img
                    src={post.images[0]}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Caption & author */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {post.author?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{post.author?.name}</p>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {post.caption && (
                  <p className="text-gray-700 text-sm mb-3">{post.caption}</p>
                )}

                {/* Interaction stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-3 items-center">
                  <span>❤️ {post.likes} likes</span>
                  <span>💬 {post.comments?.length || 0} comments</span>
                  {user && (
                    <button
                      onClick={() => handleReport(post._id)}
                      className="text-blue-600 hover:text-blue-800 transition font-semibold"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

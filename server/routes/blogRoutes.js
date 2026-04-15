// routes/blogRoutes.js
import express from "express";
import Blog from "../models/Blog.js";
import { verifyToken, requireOrganizer } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "event-app/blogs" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

// Create blog post
router.post("/", verifyToken, requireOrganizer, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);
    const blog = await Blog.create({
      ...req.body,
      author: req.user.id,
      image: imageUrl,
    });
    await blog.populate("author", "name email");
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all blogs (public, sorted by recent)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .populate("event", "title")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get featured/ongoing blogs for carousel
router.get("/featured/carousel", async (req, res) => {
  try {
    const blogs = await Blog.find({ featured: true })
      .populate("author", "name email")
      .populate("event", "title date timezone")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email")
      .populate("event", "title")
      .populate("comments.user", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update blog
router.put("/:id", verifyToken, requireOrganizer, upload.single("image"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your blog" });

    const updateData = { ...req.body };
    if (req.file) updateData.image = await uploadToCloudinary(req.file.buffer);
    updateData.updatedAt = new Date();

    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("author", "name email");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete blog
router.delete("/:id", verifyToken, requireOrganizer, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your blog" });

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like blog
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const alreadyLiked = blog.likedBy.includes(req.user.id);
    if (alreadyLiked) {
      blog.likedBy = blog.likedBy.filter(id => id.toString() !== req.user.id);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      blog.likedBy.push(req.user.id);
      blog.likes += 1;
    }
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment to blog
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date()
    });
    await blog.save();
    await blog.populate("comments.user", "name email");
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

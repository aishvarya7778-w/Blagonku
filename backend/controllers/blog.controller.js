import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { deleteImage, uploadImage } from "../services/cloudinary.service.js";
import { buildPagination, sendPaginated } from "../utils/api.js";
import { sanitizeHtml, stripHtml } from "../utils/text.js";

const authorSelect = "username profileImage bio role";

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean);
  if (typeof tags === "string") return tags.split(",").map((tag) => tag.toLowerCase().trim()).filter(Boolean);
  return [];
};

const canModifyBlog = (user, blog) => user.role === "admin" || blog.author.toString() === user._id.toString();

export const listBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const filter = { status: "published" };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = req.query.tag.toLowerCase();
    if (req.query.search) filter.$text = { $search: req.query.search };

    const sort =
      req.query.sort === "trending"
        ? { views: -1, commentsCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [blogs, total] = await Promise.all([
      Blog.find(filter).populate("author", authorSelect).sort(sort).skip(skip).limit(limit).lean(),
      Blog.countDocuments(filter)
    ]);

    return sendPaginated(res, { data: blogs, total, page, limit });
  } catch (error) {
    return next(error);
  }
};

export const getFeaturedBlogs = async (_req, res, next) => {
  try {
    const blogs = await Blog.find({ status: "published", featured: true })
      .populate("author", authorSelect)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    return res.status(200).json({ data: blogs });
  } catch (error) {
    return next(error);
  }
};

export const getTrendingBlogs = async (_req, res, next) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .populate("author", authorSelect)
      .sort({ views: -1, commentsCount: -1, createdAt: -1 })
      .limit(6)
      .lean();
    return res.status(200).json({ data: blogs });
  } catch (error) {
    return next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", authorSelect)
      .lean();

    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }

    const related = await Blog.find({
      _id: { $ne: blog._id },
      status: "published",
      $or: [{ category: blog.category }, { tags: { $in: blog.tags } }]
    })
      .select("title slug excerpt coverImage category readingTime")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return res.status(200).json({ data: blog, related });
  } catch (error) {
    return next(error);
  }
};

export const getMyBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({ data: blogs });
  } catch (error) {
    return next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const coverImage = req.file ? await uploadImage(req.file.buffer, "blagonku/blogs") : undefined;
    const cleanContent = sanitizeHtml(req.body.content);
    const blog = await Blog.create({
      ...req.body,
      tags: normalizeTags(req.body.tags),
      excerpt: req.body.excerpt || stripHtml(cleanContent).slice(0, 220),
      content: cleanContent,
      coverImage,
      author: req.user._id
    });

    const populated = await blog.populate("author", authorSelect);
    return res.status(201).json({ data: populated });
  } catch (error) {
    return next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }
    if (!canModifyBlog(req.user, blog)) {
      const error = new Error("You can only edit your own blogs");
      error.statusCode = 403;
      throw error;
    }

    if (req.file) {
      await deleteImage(blog.coverImage?.publicId);
      blog.coverImage = await uploadImage(req.file.buffer, "blagonku/blogs");
    }

    ["title", "excerpt", "category", "status"].forEach((field) => {
      if (req.body[field] !== undefined) blog[field] = req.body[field];
    });
    if (req.body.content) blog.content = sanitizeHtml(req.body.content);
    if (req.body.tags !== undefined) blog.tags = normalizeTags(req.body.tags);

    await blog.save();
    const populated = await blog.populate("author", authorSelect);
    return res.status(200).json({ data: populated });
  } catch (error) {
    return next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }
    if (!canModifyBlog(req.user, blog)) {
      const error = new Error("You can only delete your own blogs");
      error.statusCode = 403;
      throw error;
    }

    await Promise.all([
      deleteImage(blog.coverImage?.publicId),
      Comment.deleteMany({ blog: blog._id }),
      User.updateMany({}, { $pull: { bookmarks: blog._id } }),
      blog.deleteOne()
    ]);

    return res.status(200).json({ message: "Blog deleted" });
  } catch (error) {
    return next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).select("likes status");
    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }

    const liked = blog.likes.some((id) => id.equals(req.user._id));
    const update = liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } };
    const updatedBlog = await Blog.findByIdAndUpdate(blog._id, update, { new: true, select: "likes" }).lean();

    return res.status(200).json({
      liked: !liked,
      likesCount: updatedBlog.likes.length,
      likes: updatedBlog.likes
    });
  } catch (error) {
    return next(error);
  }
};

export const reportBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, {
      $addToSet: { reports: { user: req.user._id, reason: req.body.reason } }
    });
    return res.status(201).json({ message: "Report submitted" });
  } catch (error) {
    return next(error);
  }
};

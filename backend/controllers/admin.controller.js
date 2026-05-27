import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { buildPagination, sendPaginated } from "../utils/api.js";

export const dashboard = async (_req, res, next) => {
  try {
    const [totalUsers, totalBlogs, totalComments, recentUsers, recentBlogs, reportedBlogs, reportedComments] =
      await Promise.all([
        User.countDocuments(),
        Blog.countDocuments(),
        Comment.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5).select("username email role createdAt").lean(),
        Blog.find().sort({ createdAt: -1 }).limit(5).select("title slug status createdAt").populate("author", "username").lean(),
        Blog.countDocuments({ "reports.0": { $exists: true } }),
        Comment.countDocuments({ "reports.0": { $exists: true } })
      ]);

    return res.status(200).json({
      stats: { totalUsers, totalBlogs, totalComments, reportedBlogs, reportedComments },
      recentActivity: { users: recentUsers, blogs: recentBlogs }
    });
  } catch (error) {
    return next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const [users, total] = await Promise.all([
      User.find().select("-password -refreshTokenHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments()
    ]);
    return sendPaginated(res, { data: users, total, page, limit });
  } catch (error) {
    return next(error);
  }
};

export const listAllBlogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const [blogs, total] = await Promise.all([
      Blog.find().populate("author", "username email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments()
    ]);
    return sendPaginated(res, { data: blogs, total, page, limit });
  } catch (error) {
    return next(error);
  }
};

export const setUserSuspension = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      const error = new Error("Admins cannot suspend themselves");
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: Boolean(req.body.isSuspended), $unset: { refreshTokenHash: "" } },
      { new: true }
    ).select("-password -refreshTokenHash");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const moderateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, featured: Boolean(req.body.featured) },
      { new: true }
    ).populate("author", "username email");
    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ data: blog });
  } catch (error) {
    return next(error);
  }
};

export const hideComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isHidden: Boolean(req.body.isHidden) },
      { new: true }
    ).populate("user", "username email");
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ data: comment });
  } catch (error) {
    return next(error);
  }
};

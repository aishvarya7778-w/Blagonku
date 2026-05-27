import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { deleteImage, uploadImage } from "../services/cloudinary.service.js";

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.username !== undefined) user.username = req.body.username;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.file) {
      await deleteImage(user.profileImage?.publicId);
      user.profileImage = await uploadImage(req.file.buffer, "blagonku/profiles");
    }
    await user.save();
    return res.status(200).json({ user: user.toSafeObject() });
  } catch (error) {
    return next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.blogId).select("_id");
    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(req.user._id).select("bookmarks");
    const bookmarked = user.bookmarks.some((id) => id.equals(blog._id));
    const update = bookmarked ? { $pull: { bookmarks: blog._id } } : { $addToSet: { bookmarks: blog._id } };
    const updatedUser = await User.findByIdAndUpdate(user._id, update, {
      new: true,
      select: "bookmarks"
    }).lean();

    return res.status(200).json({ bookmarked: !bookmarked, bookmarks: updatedUser.bookmarks });
  } catch (error) {
    return next(error);
  }
};

export const listBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      match: { status: "published" },
      populate: { path: "author", select: "username profileImage" },
      options: { sort: { createdAt: -1 } }
    });
    return res.status(200).json({ data: user.bookmarks });
  } catch (error) {
    return next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("username profileImage bio role createdAt").lean();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const blogs = await Blog.find({ author: user._id, status: "published" })
      .select("title slug excerpt coverImage category readingTime createdAt")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return res.status(200).json({ user, blogs });
  } catch (error) {
    return next(error);
  }
};

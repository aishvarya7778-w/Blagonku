import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

const userSelect = "username profileImage role";

const buildCommentTree = (comments) => {
  const byId = new Map();
  const roots = [];

  comments.forEach((comment) => {
    byId.set(comment._id.toString(), { ...comment, replies: [] });
  });

  byId.forEach((comment) => {
    const parentId = comment.parentComment?.toString();
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).replies.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
};

const assertCommentAccess = (user, comment) => {
  const allowed = user.role === "admin" || comment.user.toString() === user._id.toString();
  if (!allowed) {
    const error = new Error("You cannot modify this comment");
    error.statusCode = 403;
    throw error;
  }
};

const collectDescendantIds = async (rootIds) => {
  const all = [];
  let frontier = rootIds;

  while (frontier.length > 0) {
    const children = await Comment.find({ parentComment: { $in: frontier } }).select("_id").lean();
    frontier = children.map((child) => child._id);
    all.push(...frontier);
  }

  return all;
};

export const listComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId, isHidden: false })
      .populate("user", userSelect)
      .sort({ createdAt: 1 })
      .limit(250)
      .lean();

    return res.status(200).json({ data: buildCommentTree(comments) });
  } catch (error) {
    return next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.blogId).select("_id");
    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }

    const comment = await Comment.create({
      blog: blog._id,
      user: req.user._id,
      content: req.body.content,
      parentComment: null
    });

    await Blog.findByIdAndUpdate(blog._id, { $inc: { commentsCount: 1 } });
    const populated = await comment.populate("user", userSelect);
    return res.status(201).json({ data: { ...populated.toObject(), replies: [] } });
  } catch (error) {
    return next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.isHidden) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    assertCommentAccess(req.user, comment);
    comment.content = req.body.content;
    await comment.save();

    const populated = await comment.populate("user", userSelect);
    return res.status(200).json({ data: populated });
  } catch (error) {
    return next(error);
  }
};

export const replyToComment = async (req, res, next) => {
  try {
    const parent = await Comment.findById(req.params.commentId);
    if (!parent || parent.isHidden) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    const reply = await Comment.create({
      blog: parent.blog,
      user: req.user._id,
      content: req.body.content,
      parentComment: parent._id
    });

    await Blog.findByIdAndUpdate(parent.blog, { $inc: { commentsCount: 1 } });
    const populated = await reply.populate("user", userSelect);
    return res.status(201).json({ data: { ...populated.toObject(), replies: [] } });
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    assertCommentAccess(req.user, comment);

    const childIds = await collectDescendantIds([comment._id]);
    const idsToDelete = [comment._id, ...childIds];
    const deleted = await Comment.deleteMany({ _id: { $in: idsToDelete } });
    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -deleted.deletedCount } });

    return res.status(200).json({ message: "Comment deleted", deletedCount: deleted.deletedCount });
  } catch (error) {
    return next(error);
  }
};

export const toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId).select("likes isHidden");
    if (!comment || comment.isHidden) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    const liked = comment.likes.some((id) => id.equals(req.user._id));
    const update = liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } };
    const updated = await Comment.findByIdAndUpdate(comment._id, update, { new: true, select: "likes" }).lean();

    return res.status(200).json({ liked: !liked, likesCount: updated.likes.length, likes: updated.likes });
  } catch (error) {
    return next(error);
  }
};

export const reportComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $addToSet: { reports: { user: req.user._id, reason: req.body.reason } } },
      { new: true }
    );
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(201).json({ message: "Report submitted" });
  } catch (error) {
    return next(error);
  }
};

import { Router } from "express";
import {
  createComment,
  deleteComment,
  listComments,
  replyToComment,
  reportComment,
  toggleCommentLike,
  updateComment
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { reportSchema } from "../validators/blog.validator.js";
import { commentSchema, replySchema } from "../validators/comment.validator.js";

const router = Router();

router.get("/:blogId", listComments);
router.post("/:blogId", authMiddleware, validate(commentSchema), createComment);
router.put("/:commentId", authMiddleware, validate(commentSchema), updateComment);
router.delete("/:commentId", authMiddleware, deleteComment);
router.post("/:commentId/reply", authMiddleware, validate(replySchema), replyToComment);
router.post("/:commentId/like", authMiddleware, toggleCommentLike);

// Backward-compatible aliases used by the existing frontend.
router.get("/blog/:blogId", listComments);
router.post("/blog/:blogId", authMiddleware, validate(commentSchema), createComment);
router.post("/:commentId/replies", authMiddleware, validate(replySchema), replyToComment);
router.post("/:commentId/report", authMiddleware, validate(reportSchema), reportComment);

export default router;

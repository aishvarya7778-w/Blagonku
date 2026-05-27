import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  getFeaturedBlogs,
  getMyBlogs,
  getTrendingBlogs,
  listBlogs,
  reportBlog,
  toggleLike,
  updateBlog
} from "../controllers/blog.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { blogSchema, reportSchema, updateBlogSchema } from "../validators/blog.validator.js";

const router = Router();

router.get("/", listBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/mine", authMiddleware, getMyBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/", authMiddleware, upload.single("coverImage"), validate(blogSchema), createBlog);
router.patch("/:id", authMiddleware, upload.single("coverImage"), validate(updateBlogSchema), updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/report", authMiddleware, validate(reportSchema), reportBlog);

export default router;

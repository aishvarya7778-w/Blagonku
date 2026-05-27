import { Router } from "express";
import { dashboard, hideComment, listAllBlogs, listUsers, moderateBlog, setUserSuspension } from "../controllers/admin.controller.js";
import { adminMiddleware, authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { hideCommentSchema, moderateBlogSchema, suspensionSchema } from "../validators/admin.validator.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.get("/blogs", listAllBlogs);
router.patch("/users/:id/suspension", validate(suspensionSchema), setUserSuspension);
router.patch("/blogs/:id", validate(moderateBlogSchema), moderateBlog);
router.patch("/comments/:id", validate(hideCommentSchema), hideComment);

export default router;

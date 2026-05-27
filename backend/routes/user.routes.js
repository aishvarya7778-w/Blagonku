import { Router } from "express";
import { getPublicProfile, listBookmarks, toggleBookmark, updateProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { profileSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/bookmarks", authMiddleware, listBookmarks);
router.post("/bookmarks/:blogId", authMiddleware, toggleBookmark);
router.patch("/me", authMiddleware, upload.single("profileImage"), validate(profileSchema), updateProfile);
router.get("/:id", getPublicProfile);

export default router;

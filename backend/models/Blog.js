import mongoose from "mongoose";
import slugify from "slugify";
import { estimateReadingTime, stripHtml } from "../utils/text.js";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
      index: "text"
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 240,
      index: "text"
    },
    coverImage: {
      url: String,
      publicId: String
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        index: true
      }
    ],
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    commentsCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, maxlength: 240 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    views: {
      type: Number,
      default: 0,
      index: true
    }
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", excerpt: "text", tags: "text", category: "text" });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ status: 1, featured: 1, createdAt: -1 });
blogSchema.index({ status: 1, views: -1, "likes.0": 1 });

blogSchema.pre("validate", async function makeSlug(next) {
  if (!this.isModified("title") && this.slug) return next();

  const base = slugify(this.title, { lower: true, strict: true, trim: true });
  let slug = base;
  let suffix = 1;

  while (await mongoose.models.Blog.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  this.slug = slug;
  next();
});

blogSchema.pre("save", function deriveContentMeta(next) {
  this.readingTime = estimateReadingTime(stripHtml(this.content));
  if (!this.excerpt) this.excerpt = stripHtml(this.content).slice(0, 220);
  next();
});

export default mongoose.model("Blog", blogSchema);

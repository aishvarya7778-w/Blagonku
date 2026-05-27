import Joi from "joi";

export const blogSchema = Joi.object({
  title: Joi.string().trim().min(4).max(140).required(),
  content: Joi.string().min(20).required(),
  excerpt: Joi.string().max(240).allow("").optional(),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim().max(32)).max(10), Joi.string().allow(""))
    .optional(),
  category: Joi.string().trim().min(2).max(60).required(),
  status: Joi.string().valid("draft", "published").default("draft")
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().trim().min(4).max(140).optional(),
  content: Joi.string().min(20).optional(),
  excerpt: Joi.string().max(240).allow("").optional(),
  tags: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim().max(32)).max(10), Joi.string().allow(""))
    .optional(),
  category: Joi.string().trim().min(2).max(60).optional(),
  status: Joi.string().valid("draft", "published").optional()
});

export const reportSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(240).required()
});

import Joi from "joi";

export const suspensionSchema = Joi.object({
  isSuspended: Joi.boolean().required()
});

export const moderateBlogSchema = Joi.object({
  status: Joi.string().valid("draft", "published").required(),
  featured: Joi.boolean().default(false)
});

export const hideCommentSchema = Joi.object({
  isHidden: Joi.boolean().required()
});

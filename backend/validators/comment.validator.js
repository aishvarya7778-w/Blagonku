import Joi from "joi";

export const commentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1200).required()
});

export const replySchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required()
});

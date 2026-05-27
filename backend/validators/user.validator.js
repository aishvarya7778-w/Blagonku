import Joi from "joi";

export const profileSchema = Joi.object({
  username: Joi.string().trim().min(3).max(32).optional(),
  bio: Joi.string().max(300).allow("").optional()
});

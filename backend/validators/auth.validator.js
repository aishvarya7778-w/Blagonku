import Joi from "joi";

export const signupSchema = Joi.object({
  username: Joi.string().trim().min(3).max(32).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  bio: Joi.string().max(300).allow("").optional(),
  adminSecretKey: Joi.string().max(200).allow("").optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

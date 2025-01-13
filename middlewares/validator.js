import Joi from 'joi';

export const signupSchema = Joi.object({
    email: Joi.string().min(0).max(60).required().email({
        tlds: {allow: false}
    }),
    password: Joi.string()
    .required()
    .pattern(new RegExp('^(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{3,30}$')),
});

export const signinSchema = Joi.object({
    email: Joi.string().min(0).max(60).required().email({
        tlds: {allow: false}
    }),
    password: Joi.string()
    .required()
    .pattern(new RegExp('^(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{3,30}$')),
});

export default {
    signupSchema,
    signinSchema,
 };

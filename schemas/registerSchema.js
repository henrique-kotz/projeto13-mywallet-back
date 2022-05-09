import joi from 'joi';

const registerSchema = joi.object({
    username: joi.string().alphanum().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    repeat_password: joi.ref('password')
});

export default registerSchema;
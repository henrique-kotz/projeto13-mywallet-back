import joi from 'joi';

const transactionSchema = joi.object({
    value: joi.string().pattern(/^[0-9]+,[0-9]{2}$/).required(),
    description: joi.string().min(3).max(30).required()
});

export default transactionSchema;
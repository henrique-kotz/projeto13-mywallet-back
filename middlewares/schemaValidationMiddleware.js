import registerSchema from "../schemas/registerSchema.js";
import loginSchema from "../schemas/loginSchema.js";
import transactionSchema from "../schemas/transactionSchema.js";

export async function validateRegister(req, res, next) {
    const { password, repeat_password } = req.body;
    const { error } = registerSchema.validate(req.body);
    if (error || password !== repeat_password) {
        res.status(422).send('Dados inválidos!');
        return;
    }

    next();
}

export async function validateLogin(req, res, next) {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.status(422).send('Dados inválidos');
        return;
    }

    next();
}

export async function validateTransaction(req, res, next) {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        res.status(422).send('Dados inválidos!');
        return;
    }

    next();
}
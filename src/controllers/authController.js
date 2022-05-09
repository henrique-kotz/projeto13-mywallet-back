import db from '../db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';

export async function signUp(req, res) {
    const register = req.body;
    const { username, email, password } = req.body;
    const registerSchema = joi.object({
        username: joi.string().alphanum().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        repeat_password: joi.ref('password')
    });

    const { error } = registerSchema.validate(register);
    if (error || password !== register.repeat_password) {
        res.status(422).send('Dados inválidos!');
        return;
    }

    try {
        const userCollection = db.collection('users');

        const usernameConflict = await userCollection.findOne({ username });
        const emailConflict = await userCollection.findOne({ email });
        if (usernameConflict || emailConflict) {
            res.status(409).send('Usuário já existe!');
            return;
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        await userCollection.insertOne({
            username, email,
            password: passwordHash
        });
        res.sendStatus(201);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function signIn(req, res) {
    const login = req.body;
    const { email, password } = req.body;

    const loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = loginSchema.validate(login);
    if (error) {
        res.status(422).send('Dados inválidos');
        return;
    }

    try {
        const user = await db.collection('users').findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const session = await db.collection('sessions').findOne({ userId: user._id });
            if (session) {
                res.send({
                    name: user.username,
                    token: session.token
                });
            } else {
                const token = uuid();
                await db.collection('sessions').insertOne({
                    token,
                    userId: user._id
                });
                res.send({
                    name: user.username,
                    token
                });
            }
        } else {
            res.status(404).send('Usuário não existe!');
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}
import db from '../db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export async function signUp(req, res) {
    const { username, email, password } = req.body;

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
    const { email, password } = req.body;

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
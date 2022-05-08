import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(cors());
app.use(json());

dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db('my-wallet');
    console.log('Connected with my-wallet database');
});

app.post('/sign-up', async (req, res) => {
    const register = req.body;
    const { username, email, password } = req.body;
    const registerSchema = joi.object({
        username: joi.string().alphanum().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        repeat_password: joi.ref('password')
    });

    const { error } = registerSchema.validate(register, { abortEarly: false });
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
});

app.post('/', async (req, res) => {
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
                res.send(session.token);
            } else {
                const token = uuid();
                await db.collection('sessions').insertOne({
                    token,
                    userId: user._id
                });
                res.send(token);
            }
        } else {
            res.status(404).send('Usuário não existe!');
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});


app.listen(5000, () => {
    console.log('Listening on port 5000...');
});
import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import bcrypt from 'bcrypt';

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
    console.log(req.body);
    const { username, email, password } = req.body;
    const registerSchema = joi.object({
        username: joi.string().alphanum().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        repeat_password: joi.ref('password')
    });

    const { error } = registerSchema.validate(register, { abortEarly: false });
    if (error || password !== register.repeat_password) {
        res.sendStatus(422)
        return;
    }

    try {
        const userCollection = db.collection('users');

        const usernameConflict = await userCollection.findOne({ username });
        const emailConflict = await userCollection.findOne({ email });
        if (usernameConflict || emailConflict) {
            res.sendStatus(409);
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


app.listen(5000, () => {
    console.log('Listening on port 5000...');
});
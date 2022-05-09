import db from '../db.js';
import joi from 'joi';
import dayjs from 'dayjs';

export async function getTransactions(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) return res.sendStatus(401);

        const user = await db.collection('users').findOne({ _id: session.userId });
        if (user) {
            const data = await db.collection('statement')
                .find({ user: user.username }, 
                { projection: { _id: 0, user: 0 }}).toArray();
            res.send(data);
        } else {
            res.sendStatus(401);
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function postTransaction(req, res) {
    const { type } = req.params;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    const { value, description } = req.body;
    const transactionSchema = joi.object({
        value: joi.string().pattern(/^[0-9]+,[0-9]{2}$/).required(),
        description: joi.string().min(3).max(30).required()
    });
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        res.status(422).send('Dados inválidos!');
        return;
    }
    const formattedValue = value.replace(',', '.');

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) return res.sendStatus(401);

        const user = await db.collection('users').findOne({ _id: session.userId });
        if (user) {
            await db.collection('statement').insertOne({
                user: user.username,
                value: parseFloat(formattedValue),
                description,
                type,
                date: dayjs().format('DD/MM')
            });
            res.sendStatus(201);
        } else {
            res.sendStatus(401);
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}
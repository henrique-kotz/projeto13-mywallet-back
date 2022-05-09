import db from '../db.js';
import dayjs from 'dayjs';

export async function getTransactions(req, res) {
    const { user } = res.locals;

    try {
        const data = await db.collection('statement')
            .find({ user: user.username }, 
            { projection: { _id: 0, user: 0 }}).toArray();
        res.send(data);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function postTransaction(req, res) {
    const { user, type } = res.locals;
    const { value, description } = req.body;
    const formattedValue = value.replace(',', '.');

    try {
        await db.collection('statement').insertOne({
            user: user.username,
            value: parseFloat(formattedValue),
            description,
            type,
            date: dayjs().format('DD/MM')
        });
        res.sendStatus(201);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}
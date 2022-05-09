import db from '../db.js';

export async function validateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) return res.sendStatus(401);

        const user = await db.collection('users').findOne({ _id: session.userId });
        if (user) {
            res.locals.user = user;
        } else {
            res.sendStatus(401);
            return;
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }

    next();
}
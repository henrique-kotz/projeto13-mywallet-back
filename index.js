import express, { json } from 'express';
import cors from 'cors';

import authRouter from './routes/authRouter.js';
import homeRouter from './routes/homeRouter.js';

const app = express();
app.use(cors());
app.use(json());

app.use(authRouter);
app.use(homeRouter);


app.listen(5000, () => {
    console.log('Listening on port 5000...');
});
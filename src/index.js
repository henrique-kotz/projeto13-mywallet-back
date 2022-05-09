import express, { json } from 'express';
import cors from 'cors';

import { signUp, signIn } from './controllers/authController.js';
import { getTransactions, postTransaction } from './controllers/homeController.js';

const app = express();
app.use(cors());
app.use(json());


app.post('/sign-up', signUp);
app.post('/sign-in', signIn);

app.get('/home', getTransactions);
app.post('/home/:type', postTransaction);


app.listen(5000, () => {
    console.log('Listening on port 5000...');
});
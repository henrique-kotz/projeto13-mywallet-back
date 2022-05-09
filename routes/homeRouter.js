import { Router } from 'express';

import { getTransactions, postTransaction } from '../controllers/homeController.js';
import { validateTransaction } from '../middlewares/schemaValidationMiddleware.js';
import { validateToken } from '../middlewares/tokenValidationMiddleware.js';

const homeRouter = Router();
homeRouter.use(validateToken);

homeRouter.get('/home', getTransactions);
homeRouter.post('/home/:type', validateTransaction, postTransaction);

export default homeRouter;
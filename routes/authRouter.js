import { Router } from 'express';

import { signUp, signIn } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middlewares/schemaValidationMiddleware.js';

const authRouter = Router();

authRouter.post('/sign-up', validateRegister, signUp);
authRouter.post('/sign-in', validateLogin, signIn);

export default authRouter;
import express from 'express';
const router = express.Router();
import { Login, changeMyPassword, Logout } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyUserAndSession from '../middlewares/verifyUserAndSession.js';

router.post('/login', Login);

router.put('/change-password', verifyToken, verifyUserAndSession, changeMyPassword);

router.post('/logout', verifyToken, verifyUserAndSession, Logout);

export default router;
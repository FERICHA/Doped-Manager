import express from 'express';
import { GetAllUsersSession, GetUserByIdSession, CreateUserSession, DeleteUserSession, UpdateUserSession, myProfil, updateMyProfil } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyUserAndSession from '../middlewares/verifyUserAndSession.js';

const router = express.Router();

router.get('/', verifyToken, GetAllUsersSession);

router.get('/:id', verifyToken, GetUserByIdSession);

router.post('/', verifyToken, CreateUserSession);

router.delete('/:id', verifyToken , DeleteUserSession);

router.patch('/:id', verifyToken , UpdateUserSession);

router.get('/me/profile', verifyToken, verifyUserAndSession, myProfil);

router.patch('/me/profile', verifyToken, verifyUserAndSession, updateMyProfil);


export default router;
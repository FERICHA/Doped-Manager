import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyUserAndSession from '../middlewares/verifyUserAndSession.js';

const router = express.Router();

router.use(verifyToken, verifyUserAndSession);

router.get('/', transactionController.getAllTransactions);

router.get('/recent', transactionController.getRecentTransactions);

router.post('/', transactionController.addTransaction);

router.put('/:id', transactionController.updateTransaction);

router.delete('/:id', transactionController.deleteTransaction);

export default router;

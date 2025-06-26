import express from 'express';
import * as productController from '../controllers/productController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyUserAndSession  from '../middlewares/verifyUserAndSession.js';

const router = express.Router();

router.use(verifyToken, verifyUserAndSession);

router.get('/', productController.getAllProducts);

router.get('/low-stock', productController.getLowStockProducts);

router.post('/', productController.addProduct);

router.put('/:id', productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

export default router;

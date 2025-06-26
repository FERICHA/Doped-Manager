import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyUserAndSession from '../middlewares/verifyUserAndSession.js';

const router = express.Router();

router.use(verifyToken, verifyUserAndSession);

router.get('/', employeeController.getAllEmployees);

router.post('/', employeeController.addEmployee);

router.put('/:id', employeeController.updateEmployee);

router.delete('/:id', employeeController.deleteEmployee);

export default router;
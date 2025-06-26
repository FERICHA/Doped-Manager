import express from 'express';
import * as absenceController from '../controllers/absenceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import verifyUserAndSession from '../middlewares/verifyUserAndSession.js';

const router = express.Router();

router.use(verifyToken, verifyUserAndSession);

router.get('/', absenceController.getAllAbsences);

router.post('/', absenceController.addAbsence);

router.put('/:id', absenceController.updateAbsence);

router.delete('/:id', absenceController.deleteAbsence);

export default router;
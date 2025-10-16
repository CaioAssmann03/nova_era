import express from 'express';
import * as barberController from '../controllers/barberController';
import { validateBarber, validateNumericId } from '../middleware/validation';

const router = express.Router();

router.post('/', validateBarber, barberController.createBarber);
router.get('/', barberController.getAllBarbers);
router.get('/:id', validateNumericId, barberController.getBarberById);
router.put('/:id', validateNumericId, validateBarber, barberController.updateBarber);
router.delete('/:id', validateNumericId, barberController.deleteBarber);

export default router;
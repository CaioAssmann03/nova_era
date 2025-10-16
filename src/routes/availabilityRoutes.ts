import express from 'express';
import { getAvailableSlots } from '../controllers/availabilityController';

const router = express.Router();

// Rota para verificar disponibilidade de horários
router.get('/', getAvailableSlots);

export default router;
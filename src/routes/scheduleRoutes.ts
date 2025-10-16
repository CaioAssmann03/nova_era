import express from 'express';
import { ScheduleController } from '../controllers/scheduleController';
import { validateSchedule, validateNumericId } from '../middleware/validation';

const router = express.Router();
const scheduleController = new ScheduleController();

// Schedule routes
router.post('/', validateSchedule, scheduleController.createSchedule.bind(scheduleController));
router.get('/', scheduleController.getAllSchedules.bind(scheduleController));
router.get('/:id', validateNumericId, scheduleController.getScheduleById.bind(scheduleController));
router.put('/:id', validateNumericId, scheduleController.updateSchedule.bind(scheduleController));
router.delete('/:id', validateNumericId, scheduleController.deleteSchedule.bind(scheduleController));

// Nova rota para transferir agendamentos
router.post('/transfer', scheduleController.transferSchedules.bind(scheduleController));

export default router;
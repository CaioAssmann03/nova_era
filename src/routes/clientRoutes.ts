import express from 'express';
import * as clientController from '../controllers/clientController';
import { validateClient, validateNumericId } from '../middleware/validation';

const router = express.Router();

router.post('/', validateClient, clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/:id', validateNumericId, clientController.getClientById);
router.put('/:id', validateNumericId, validateClient, clientController.updateClient);
router.delete('/:id', validateNumericId, clientController.deleteClient);

export default router;
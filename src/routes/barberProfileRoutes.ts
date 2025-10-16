import express from 'express';
import * as barberProfileController from '../controllers/barberProfileController';
import { validateBarberProfile, validateNumericId } from '../middleware/validation';

const router = express.Router();

// Criar ou atualizar perfil do barbeiro
router.post('/barber/:barberId', validateNumericId, validateBarberProfile, barberProfileController.createOrUpdateProfile);

// Buscar perfil por ID do barbeiro
router.get('/barber/:barberId', validateNumericId, barberProfileController.getProfileByBarberId);

// Listar todos os perfis
router.get('/', barberProfileController.getAllProfiles);

// Buscar por especialidade
router.get('/search', barberProfileController.searchBySpecialty);

// Atualizar rating do barbeiro
router.put('/barber/:barberId/rating', validateNumericId, barberProfileController.updateRating);

// Deletar perfil do barbeiro
router.delete('/barber/:barberId', validateNumericId, barberProfileController.deleteProfile);

export default router;
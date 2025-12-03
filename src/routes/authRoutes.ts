import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/auth/barber/login
 * Login do barbeiro
 * Body: { email: string, password: string }
 * Response: { token: string, user: { id, name, email, type } }
 */
router.post('/barber/login', (req, res) => authController.barberLogin(req, res));

/**
 * POST /api/auth/client/login
 * Login do cliente
 * Body: { email: string, password: string }
 * Response: { token: string, user: { id, name, email, type } }
 */
router.post('/client/login', (req, res) => authController.clientLogin(req, res));

export default router;

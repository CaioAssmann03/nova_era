import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async barberLogin(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.barberLogin(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async clientLogin(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.clientLogin(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

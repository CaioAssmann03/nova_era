import { Request, Response, NextFunction } from 'express';
import { JwtUtils, TokenPayload } from '../utils/jwtUtils';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export class AuthMiddleware {
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = JwtUtils.verifyToken(token);

      if (!decoded) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Erro ao validar token' });
    }
  }

  static requireBarber(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || req.user.type !== 'barber') {
      res.status(403).json({ message: 'Acesso restrito a barbeiros' });
      return;
    }
    next();
  }

  static requireClient(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || req.user.type !== 'client') {
      res.status(403).json({ message: 'Acesso restrito a clientes' });
      return;
    }
    next();
  }
}

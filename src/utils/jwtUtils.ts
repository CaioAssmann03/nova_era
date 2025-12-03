import jwt, { SignOptions, Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'barbershop-secret-key-2025';
const JWT_EXPIRY = '7d';

export interface TokenPayload {
  id: number;
  email: string;
  type: 'barber' | 'client';
}

export class JwtUtils {
  static generateToken(payload: TokenPayload): string {
    const options: SignOptions = { 
      expiresIn: JWT_EXPIRY
    };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

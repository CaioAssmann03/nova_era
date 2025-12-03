import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Barber } from '../entity/Barber';
import { Client } from '../entity/Client';
import { PasswordUtils } from '../utils/passwordUtils';
import { JwtUtils, TokenPayload } from '../utils/jwtUtils';
import { databaseService } from '../utils/databaseService';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    type: 'barber' | 'client';
  };
}

export class AuthService {
  private barberRepository: Repository<Barber>;
  private clientRepository: Repository<Client>;

  constructor() {
    this.barberRepository = AppDataSource.getRepository(Barber);
    this.clientRepository = AppDataSource.getRepository(Client);
  }

  async barberLogin(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      await databaseService.waitForInitialization();
      const { email, password } = loginData;

      // Validar entrada
      if (!email || !password) {
        const error: any = new Error('Email e senha são obrigatórios');
        error.status = 400;
        throw error;
      }

      // Buscar barbeiro
      const barber = await this.barberRepository.findOne({ where: { email } });

      if (!barber) {
        const error: any = new Error('Barbeiro não encontrado');
        error.status = 404;
        throw error;
      }

      // Validar senha
      const isPasswordValid = await PasswordUtils.comparePassword(password, barber.password);

      if (!isPasswordValid) {
        const error: any = new Error('Senha incorreta');
        error.status = 401;
        throw error;
      }

      // Gerar token
      const payload: TokenPayload = {
        id: barber.id,
        email: barber.email,
        type: 'barber'
      };

      const token = JwtUtils.generateToken(payload);

      return {
        token,
        user: {
          id: barber.id,
          name: barber.name,
          email: barber.email,
          type: 'barber'
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Erro ao fazer login do barbeiro');
    }
  }

  async clientLogin(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      await databaseService.waitForInitialization();
      const { email, password } = loginData;

      // Validar entrada
      if (!email || !password) {
        const error: any = new Error('Email e senha são obrigatórios');
        error.status = 400;
        throw error;
      }

      // Buscar cliente
      const client = await this.clientRepository.findOne({ where: { email } });

      if (!client) {
        const error: any = new Error('Cliente não encontrado');
        error.status = 404;
        throw error;
      }

      // Validar senha
      const isPasswordValid = await PasswordUtils.comparePassword(password, client.password);

      if (!isPasswordValid) {
        const error: any = new Error('Senha incorreta');
        error.status = 401;
        throw error;
      }

      // Gerar token
      const payload: TokenPayload = {
        id: client.id,
        email: client.email,
        type: 'client'
      };

      const token = JwtUtils.generateToken(payload);

      return {
        token,
        user: {
          id: client.id,
          name: client.name,
          email: client.email,
          type: 'client'
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Erro ao fazer login do cliente');
    }
  }

  private handleError(error: any, defaultMessage: string): Error {
    if (error.status) {
      return error;
    }

    console.error(`AuthService Error: ${defaultMessage}`, error);

    const newError = new Error(defaultMessage);
    (newError as any).status = 500;
    return newError;
  }
}

import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Client } from '../entity/Client';
import { Schedule } from '../entity/Schedule';
import { PasswordUtils } from '../utils/passwordUtils';
import { databaseService } from '../utils/databaseService';

interface CreateClientData {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface UpdateClientData {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
}

export class ClientService {
    private clientRepository: Repository<Client>;

    constructor() {
        this.clientRepository = AppDataSource.getRepository(Client);
    }

    async createClient(clientData: CreateClientData): Promise<any> {
        try {
            await databaseService.waitForInitialization();
            
            // Validar campos obrigatórios
            if (!clientData.name || !clientData.email || !clientData.password || !clientData.phone) {
                const error = new Error('Name, email, password e phone são obrigatórios') as any;
                error.status = 400;
                throw error;
            }

            await this.validateUniqueEmail(clientData.email);
            
            // Criptografar senha
            const hashedPassword = await PasswordUtils.hashPassword(clientData.password);
            
            const client = this.clientRepository.create({
                ...clientData,
                password: hashedPassword
            });
            const saved = await this.clientRepository.save(client);
            
            // Não retornar senha
            return {
                id: saved.id,
                name: saved.name,
                email: saved.email,
                phone: saved.phone
            };
        } catch (error) {
            throw this.handleError(error, 'Error creating client');
        }
    }

    async getAllClients(): Promise<any[]> {
        try {
            await databaseService.waitForInitialization();
            const clients = await this.clientRepository.find();
            // Não retornar senha
            return clients.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone
            }));
        } catch (error) {
            throw this.handleError(error, 'Error fetching clients');
        }
    }

    async getClientById(id: number): Promise<any> {
        try {
            const client = await this.clientRepository.findOne({ 
                where: { id } 
            });
            
            if (!client) {
                const error = new Error('Client not found') as any;
                error.status = 404;
                throw error;
            }
            
            // Não retornar senha
            return {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone
            };
        } catch (error) {
            throw this.handleError(error, 'Error fetching client');
        }
    }

    async updateClient(id: number, updateData: UpdateClientData): Promise<any> {
        try {
            const client = await this.clientRepository.findOne({ where: { id } });
            
            if (!client) {
                const error = new Error('Client not found') as any;
                error.status = 404;
                throw error;
            }
            
            if (updateData.email && updateData.email !== client.email) {
                await this.validateUniqueEmail(updateData.email);
            }
            
            // Se for atualizar senha, criptografar
            if (updateData.password) {
                updateData.password = await PasswordUtils.hashPassword(updateData.password);
            }
            
            this.clientRepository.merge(client, updateData);
            const updated = await this.clientRepository.save(client);
            
            // Não retornar senha
            return {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                phone: updated.phone
            };
        } catch (error) {
            throw this.handleError(error, 'Error updating client');
        }
    }

    async deleteClient(id: number): Promise<boolean> {
        try {
            await this.getClientById(id);
            await this.validateNoActiveSchedules(id);
            
            const result = await this.clientRepository.delete(id);
            return result.affected! > 0;
        } catch (error) {
            throw this.handleError(error, 'Error deleting client');
        }
    }

    private async validateUniqueEmail(email: string): Promise<void> {
        const existingClient = await this.clientRepository.findOne({ 
            where: { email } 
        });
        
        if (existingClient) {
            const error = new Error('Email already exists') as any;
            error.status = 400;
            throw error;
        }
    }

    private async validateNoActiveSchedules(clientId: number): Promise<void> {
        const scheduleRepository = AppDataSource.getRepository(Schedule);
        
        const activeSchedules = await scheduleRepository.find({
            where: { client: { id: clientId } },
            relations: ['client']
        });
        
        if (activeSchedules.length > 0) {
            const error = new Error('Cannot delete client with active schedules') as any;
            error.status = 400;
            throw error;
        }
    }

    private handleError(error: any, defaultMessage: string): Error {
        if (error.status) {
            return error;
        }
        
        console.error(`ClientService Error: ${defaultMessage}`, error);
        
        const newError = new Error(defaultMessage) as any;
        newError.status = 500;
        return newError;
    }
}
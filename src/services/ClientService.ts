import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Client } from '../entity/Client';
import { Schedule } from '../entity/Schedule';
import { databaseService } from '../utils/databaseService';

interface CreateClientData {
    name: string;
    email: string;
    phone: string;
}

interface UpdateClientData {
    name?: string;
    email?: string;
    phone?: string;
}

export class ClientService {
    private clientRepository: Repository<Client>;

    constructor() {
        this.clientRepository = AppDataSource.getRepository(Client);
    }

    async createClient(clientData: CreateClientData): Promise<Client> {
        try {
            await databaseService.waitForInitialization();
            await this.validateUniqueEmail(clientData.email);
            
            const client = this.clientRepository.create(clientData);
            return await this.clientRepository.save(client);
        } catch (error) {
            throw this.handleError(error, 'Error creating client');
        }
    }

    async getAllClients(): Promise<Client[]> {
        try {
            await databaseService.waitForInitialization();
            return await this.clientRepository.find();
        } catch (error) {
            throw this.handleError(error, 'Error fetching clients');
        }
    }

    async getClientById(id: number): Promise<Client> {
        try {
            const client = await this.clientRepository.findOne({ 
                where: { id } 
            });
            
            if (!client) {
                const error = new Error('Client not found') as any;
                error.status = 404;
                throw error;
            }
            
            return client;
        } catch (error) {
            throw this.handleError(error, 'Error fetching client');
        }
    }

    async updateClient(id: number, updateData: UpdateClientData): Promise<Client> {
        try {
            const client = await this.getClientById(id);
            
            if (updateData.email && updateData.email !== client.email) {
                await this.validateUniqueEmail(updateData.email);
            }
            
            this.clientRepository.merge(client, updateData);
            return await this.clientRepository.save(client);
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
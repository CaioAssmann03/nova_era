import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Barber } from '../entity/Barber';
import { Schedule } from '../entity/Schedule';
import { databaseService } from '../utils/databaseService';

interface CreateBarberData {
    name: string;
    email: string;
    phone: string;
}

interface UpdateBarberData {
    name?: string;
    email?: string;
    phone?: string;
}

export class BarberService {
    private barberRepository: Repository<Barber>;

    constructor() {
        this.barberRepository = AppDataSource.getRepository(Barber);
    }

    async createBarber(barberData: CreateBarberData): Promise<Barber> {
        try {
            await databaseService.waitForInitialization();
            await this.validateUniqueEmail(barberData.email);
            
            const barber = this.barberRepository.create(barberData);
            return await this.barberRepository.save(barber);
        } catch (error) {
            throw this.handleError(error, 'Error creating barber');
        }
    }

    async getAllBarbers(): Promise<Barber[]> {
        try {
            await databaseService.waitForInitialization();
            return await this.barberRepository.find();
        } catch (error) {
            throw this.handleError(error, 'Error fetching barbers');
        }
    }

    async getBarberById(id: number): Promise<Barber> {
        try {
            const barber = await this.barberRepository.findOne({ 
                where: { id } 
            });
            
            if (!barber) {
                const error = new Error('Barber not found') as any;
                error.status = 404;
                throw error;
            }
            
            return barber;
        } catch (error) {
            throw this.handleError(error, 'Error fetching barber');
        }
    }

    async updateBarber(id: number, updateData: UpdateBarberData): Promise<Barber> {
        try {
            const barber = await this.getBarberById(id);
            
            if (updateData.email && updateData.email !== barber.email) {
                await this.validateUniqueEmail(updateData.email);
            }
            
            this.barberRepository.merge(barber, updateData);
            return await this.barberRepository.save(barber);
        } catch (error) {
            throw this.handleError(error, 'Error updating barber');
        }
    }

    async deleteBarber(id: number): Promise<boolean> {
        try {
            await this.getBarberById(id);
            await this.validateNoActiveSchedules(id);
            
            const result = await this.barberRepository.delete(id);
            return result.affected! > 0;
        } catch (error) {
            throw this.handleError(error, 'Error deleting barber');
        }
    }

    private async validateUniqueEmail(email: string): Promise<void> {
        const existingBarber = await this.barberRepository.findOne({ 
            where: { email } 
        });
        
        if (existingBarber) {
            const error = new Error('Email already exists') as any;
            error.status = 400;
            throw error;
        }
    }

    private async validateNoActiveSchedules(barberId: number): Promise<void> {
        const scheduleRepository = AppDataSource.getRepository(Schedule);
        
        const activeSchedules = await scheduleRepository.find({
            where: { barber: { id: barberId } },
            relations: ['barber']
        });
        
        if (activeSchedules.length > 0) {
            const error = new Error('Cannot delete barber with active schedules') as any;
            error.status = 400;
            throw error;
        }
    }

    private handleError(error: any, defaultMessage: string): Error {
        if (error.status) {
            return error;
        }
        
        console.error(`BarberService Error: ${defaultMessage}`, error);
        
        const newError = new Error(defaultMessage) as any;
        newError.status = 500;
        return newError;
    }
}
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Schedule } from '../entity/Schedule';
import { Barber } from '../entity/Barber';
import { Client } from '../entity/Client';
import { BarberProfileService } from './BarberProfileService';
import { databaseService } from '../utils/databaseService';

export class ScheduleService {
    private scheduleRepository: Repository<Schedule>;
    private barberRepository: Repository<Barber>;
    private clientRepository: Repository<Client>;
    private barberProfileService: BarberProfileService;

    constructor() {
        this.scheduleRepository = AppDataSource.getRepository(Schedule);
        this.barberRepository = AppDataSource.getRepository(Barber);
        this.clientRepository = AppDataSource.getRepository(Client);
        this.barberProfileService = new BarberProfileService();
    }

    async createSchedule(scheduleData: any): Promise<any> {
        try {
            await databaseService.waitForInitialization();
            const { barberId, clientId, appointmentTime } = scheduleData;
            
            // Validações de negócio
            await this.validateAppointmentTime(appointmentTime);
            
            // Buscar e validar barber e client
            const barber = await this.validateAndGetBarber(barberId);
            const client = await this.validateAndGetClient(clientId);
            
            // Verificar se o barbeiro está trabalhando no horário solicitado
            const appointmentDate = new Date(appointmentTime);
            const isWorking = await this.barberProfileService.isBarberWorking(barberId, appointmentDate);
            if (!isWorking) {
                const error: any = new Error('Barbeiro não está trabalhando neste horário. Verifique os horários de funcionamento.');
                error.status = 400;
                throw error;
            }
            
            // Verificar disponibilidade do barbeiro (conflito de horários)
            await this.validateBarberAvailability(barberId, appointmentTime);
            
            // Converter para horário local para salvar no banco (mesma lógica da validação)
            const inputDate = new Date(appointmentTime);
            const offsetMinutes = inputDate.getTimezoneOffset();
            const localDate = new Date(inputDate.getTime() - (offsetMinutes * 60 * 1000));
            
            console.log(`💾 Salvando agendamento:`);
            console.log(`📅 Input: ${appointmentTime}`);
            console.log(`📅 UTC: ${inputDate.toISOString()}`);
            console.log(`📅 Local: ${localDate.toISOString()}`);
            
            // Criar agendamento
            const schedule = this.scheduleRepository.create({
                appointmentTime: localDate,
                barber,
                client
            });
            
            const savedSchedule = await this.scheduleRepository.save(schedule);
            return this.formatScheduleResponse(savedSchedule);
        } catch (error) {
            throw this.handleError(error, 'Error creating schedule');
        }
    }

    async getAllSchedules(): Promise<any[]> {
        try {
            await databaseService.waitForInitialization();
            const schedules = await this.scheduleRepository.find({
                relations: ['barber', 'client'],
                order: { appointmentTime: 'ASC' }
            });
            
            return schedules.map(schedule => this.formatScheduleResponse(schedule));
        } catch (error) {
            throw this.handleError(error, 'Error fetching schedules');
        }
    }

    async getScheduleById(id: number): Promise<any> {
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { id },
                relations: ['barber', 'client']
            });
            
            if (!schedule) {
                const error = new Error('Schedule not found');
                (error as any).status = 404;
                throw error;
            }
            
            return this.formatScheduleResponse(schedule);
        } catch (error) {
            throw this.handleError(error, 'Error fetching schedule');
        }
    }

    async updateSchedule(id: number, updateData: any): Promise<any> {
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { id },
                relations: ['barber', 'client']
            });
            
            if (!schedule) {
                const error = new Error('Schedule not found');
                (error as any).status = 404;
                throw error;
            }
            
            const { barberId, clientId, appointmentTime } = updateData;
            
            // Validar nova data se fornecida
            if (appointmentTime) {
                await this.validateAppointmentTime(appointmentTime);
                schedule.appointmentTime = new Date(appointmentTime);
            }
            
            // Validar e atualizar barbeiro se fornecido
            if (barberId && barberId !== schedule.barber.id) {
                const barber = await this.validateAndGetBarber(barberId);
                await this.validateBarberAvailability(barberId, schedule.appointmentTime, id);
                schedule.barber = barber;
            }
            
            // Validar e atualizar cliente se fornecido
            if (clientId && clientId !== schedule.client.id) {
                const client = await this.validateAndGetClient(clientId);
                schedule.client = client;
            }
            
            const updatedSchedule = await this.scheduleRepository.save(schedule);
            return this.formatScheduleResponse(updatedSchedule);
        } catch (error) {
            throw this.handleError(error, 'Error updating schedule');
        }
    }

    async deleteSchedule(id: number): Promise<boolean> {
        try {
            const schedule = await this.scheduleRepository.findOne({ where: { id } });
            
            if (!schedule) {
                const error = new Error('Schedule not found');
                (error as any).status = 404;
                throw error;
            }
            
            // Verificar se agendamento não está muito próximo (ex: menos de 2 horas)
            await this.validateCancellationTime(schedule.appointmentTime);
            
            await this.scheduleRepository.remove(schedule);
            return true;
        } catch (error) {
            throw this.handleError(error, 'Error deleting schedule');
        }
    }

    // Funcionalidade avançada: Transferir agendamentos entre barbeiros
    async transferSchedulesToBarber(fromBarberId: number, toBarberId: number): Promise<any> {
        try {
            const fromBarber = await this.validateAndGetBarber(fromBarberId);
            const toBarber = await this.validateAndGetBarber(toBarberId);
            
            const schedules = await this.scheduleRepository.find({
                where: { barber: { id: fromBarberId } },
                relations: ['barber', 'client']
            });
            
            if (schedules.length === 0) {
                const error = new Error('No schedules found for the specified barber');
                (error as any).status = 404;
                throw error;
            }
            
            // Validar disponibilidade do barbeiro de destino
            for (const schedule of schedules) {
                await this.validateBarberAvailability(toBarberId, schedule.appointmentTime);
            }
            
            // Transferir agendamentos
            const updatedSchedules = [];
            for (const schedule of schedules) {
                schedule.barber = toBarber;
                const updated = await this.scheduleRepository.save(schedule);
                updatedSchedules.push(this.formatScheduleResponse(updated));
            }
            
            return {
                message: `${schedules.length} schedules transferred successfully`,
                fromBarber: { id: fromBarber.id, name: fromBarber.name },
                toBarber: { id: toBarber.id, name: toBarber.name },
                schedules: updatedSchedules
            };
        } catch (error) {
            throw this.handleError(error, 'Error transferring schedules');
        }
    }

    // Método público para verificar disponibilidade
    async isTimeSlotAvailable(barberId: number, appointmentTime: Date): Promise<boolean> {
        try {
            await this.validateBarberAvailability(barberId, appointmentTime);
            return true;
        } catch {
            return false;
        }
    }

    // Validações de negócio
    private async validateAndGetBarber(barberId: number): Promise<Barber> {
        const barber = await this.barberRepository.findOne({ where: { id: barberId } });
        if (!barber) {
            const error = new Error('Barber not found');
            (error as any).status = 404;
            throw error;
        }
        return barber;
    }

    private async validateAndGetClient(clientId: number): Promise<Client> {
        const client = await this.clientRepository.findOne({ where: { id: clientId } });
        if (!client) {
            const error = new Error('Client not found');
            (error as any).status = 404;
            throw error;
        }
        return client;
    }

    private async validateAppointmentTime(appointmentTime: string): Promise<void> {
        const date = new Date(appointmentTime);
        const now = new Date();
        
        if (isNaN(date.getTime())) {
            const error = new Error('Invalid appointment time format');
            (error as any).status = 400;
            throw error;
        }
        
        if (date <= now) {
            const error = new Error('Appointment time must be in the future');
            (error as any).status = 400;
            throw error;
        }
    }

    private async validateBarberAvailability(barberId: number, appointmentTime: Date | string, excludeScheduleId: number | null = null): Promise<void> {
        // Garantir que appointmentTime seja um objeto Date
        const dateObj = appointmentTime instanceof Date ? appointmentTime : new Date(appointmentTime);
        
        // CORREÇÃO DE TIMEZONE DEFINITIVA:
        // Converter UTC para horário local real usando offset
        const offsetMinutes = dateObj.getTimezoneOffset();
        const localAppointmentTime = new Date(dateObj.getTime() - (offsetMinutes * 60 * 1000));
        
        // Converter para formato SQLite usando o horário local correto
        const dbTimeStr = localAppointmentTime.toISOString().replace('T', ' ').replace('.000Z', '.000');
        
        console.log(`🔍 Validando conflito para barberId=${barberId}`);
        console.log(`📅 Input: ${appointmentTime}`);
        console.log(`📅 Input UTC: ${dateObj.toISOString()}`);
        console.log(`📅 Offset: ${offsetMinutes} minutes`);
        console.log(`📅 Local Time: ${localAppointmentTime.toISOString()}`);
        console.log(`📅 DB Format: ${dbTimeStr}`);
        
        // Buscar agendamentos no mesmo horário exato
        const conflictingSchedule = await this.scheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.barber', 'barber')
            .where('barber.id = :barberId', { barberId })
            .andWhere('schedule.appointmentTime = :appointmentTime', { appointmentTime: dbTimeStr })
            .andWhere(excludeScheduleId ? 'schedule.id != :excludeScheduleId' : '1=1', { excludeScheduleId })
            .getOne();
        
        if (conflictingSchedule) {
            console.log(`❌ CONFLITO ENCONTRADO: Agendamento ID ${conflictingSchedule.id} já existe neste horário`);
            const error = new Error('Barbeiro já possui agendamento neste horário. Escolha outro horário disponível.');
            (error as any).status = 400;
            throw error;
        }
        
        console.log(`✅ Horário disponível - nenhum conflito encontrado`);
    }

    private async validateCancellationTime(appointmentTime: Date): Promise<void> {
        const now = new Date();
        const appointmentDate = new Date(appointmentTime);
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        
        if (hoursDiff < 2) {
            const error = new Error('Cannot cancel appointment less than 2 hours before scheduled time');
            (error as any).status = 400;
            throw error;
        }
    }

    // Formatação da resposta
    private formatScheduleResponse(schedule: Schedule): any {
        return {
            id: schedule.id,
            appointmentTime: this.formatDate(schedule.appointmentTime),
            barberId: schedule.barber ? schedule.barber.id : null,
            barberName: schedule.barber ? schedule.barber.name : null,
            clientId: schedule.client ? schedule.client.id : null,
            clientName: schedule.client ? schedule.client.name : null
        };
    }

    private formatDate(date: Date | string): string | null {
        if (!date) return null;
        
        console.log(`🐛 DEBUG formatDate - Input:`, date, `Type:`, typeof date);
        
        // Se é string (vem do banco SQLite), fazer parse direto
        if (typeof date === 'string') {
            const dateStr = date.toString().trim();
            console.log(`🔧 Processing string:`, dateStr);
            
            // Formato esperado do SQLite: "2025-10-20 15:00:00.000"
            if (dateStr.includes('-') && dateStr.includes(':')) {
                const parts = dateStr.split(' ');
                if (parts.length >= 2) {
                    const [datePart, timePart] = parts;
                    const [year, month, day] = datePart.split('-');
                    const [hours, minutes] = timePart.split(':');
                    
                    const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;
                    console.log(`✅ Formatted result:`, formatted);
                    return formatted;
                }
            }
        }
        
        // Fallback para Date objects - NÃO FAZER NEW DATE() aqui
        if (date instanceof Date) {
            console.log(`🔧 Processing Date object:`, date.toString());
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            const formatted = `${day}/${month}/${year} ${hours}:${minutes}`;
            console.log(`✅ Date formatted result:`, formatted);
            return formatted;
        }
        
        console.log(`❌ Could not format date:`, date);
        return date.toString();
    }

    // Tratamento de erros
    private handleError(error: any, defaultMessage: string): Error {
        if (error.status) {
            return error; // Erro já tratado
        }
        
        // Logs para debug
        console.error(`ScheduleService Error: ${defaultMessage}`, error);
        
        // Erro genérico
        const newError = new Error(defaultMessage);
        (newError as any).status = 500;
        return newError;
    }
}
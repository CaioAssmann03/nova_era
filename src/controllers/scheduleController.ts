import { Request, Response } from 'express';
import { ScheduleService } from '../services/ScheduleService';

export class ScheduleController {
    private scheduleService: ScheduleService;

    constructor() {
        this.scheduleService = new ScheduleService();
    }

    async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            // Apenas clientes podem criar agendamentos
            if (req.user?.type !== 'client') {
                res.status(403).json({ message: 'Apenas clientes podem agendar' });
                return;
            }

            // O cliente só pode agendar para si mesmo
            if (req.body.clientId !== req.user.id) {
                res.status(403).json({ message: 'Você só pode agendar para você mesmo' });
                return;
            }

            const schedule = await this.scheduleService.createSchedule(req.body);
            res.status(201).json(schedule);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getAllSchedules(req: Request, res: Response): Promise<void> {
        try {
            // Determina qual lista retornar baseado no tipo de usuário
            let schedules: any[];

            if (req.user?.type === 'client') {
                // Cliente vê apenas seus agendamentos
                schedules = await this.scheduleService.getClientSchedules(req.user.id);
            } else if (req.user?.type === 'barber') {
                // Barbeiro vê apenas seus horários
                schedules = await this.scheduleService.getBarberSchedules(req.user.id);
            } else {
                // Se não autenticado, retorna erro
                res.status(401).json({ message: 'Token não fornecido ou inválido' });
                return;
            }

            res.status(200).json(schedules);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getScheduleById(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.scheduleService.getScheduleById(Number(req.params.id));
            
            // Validar se o usuário tem permissão para ver este agendamento
            if (req.user?.type === 'client' && schedule.clientId !== req.user.id) {
                res.status(403).json({ message: 'Você não tem permissão para ver este agendamento' });
                return;
            }

            if (req.user?.type === 'barber' && schedule.barberId !== req.user.id) {
                res.status(403).json({ message: 'Você não tem permissão para ver este agendamento' });
                return;
            }

            res.status(200).json(schedule);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async updateSchedule(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.scheduleService.getScheduleById(Number(req.params.id));
            
            // Apenas clientes podem atualizar seus agendamentos
            if (req.user?.type === 'client' && schedule.clientId !== req.user.id) {
                res.status(403).json({ message: 'Você só pode atualizar seus próprios agendamentos' });
                return;
            }

            // Barbeiros não podem atualizar agendamentos (apenas administradores)
            if (req.user?.type === 'barber') {
                res.status(403).json({ message: 'Barbeiros não podem atualizar agendamentos' });
                return;
            }

            const updated = await this.scheduleService.updateSchedule(Number(req.params.id), req.body);
            res.status(200).json(updated);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async deleteSchedule(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.scheduleService.getScheduleById(Number(req.params.id));
            
            // Apenas clientes podem deletar seus agendamentos
            if (req.user?.type === 'client' && schedule.clientId !== req.user.id) {
                res.status(403).json({ message: 'Você só pode deletar seus próprios agendamentos' });
                return;
            }

            // Barbeiros não podem deletar agendamentos (apenas administradores)
            if (req.user?.type === 'barber') {
                res.status(403).json({ message: 'Barbeiros não podem deletar agendamentos' });
                return;
            }

            await this.scheduleService.deleteSchedule(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    // Nova funcionalidade: Transferir agendamentos entre barbeiros
    async transferSchedules(req: Request, res: Response): Promise<void> {
        try {
            // Apenas barbeiros podem transferir agendamentos
            if (req.user?.type !== 'barber') {
                res.status(403).json({ message: 'Apenas barbeiros podem transferir agendamentos' });
                return;
            }

            const { fromBarberId, toBarberId } = req.body;
            const result = await this.scheduleService.transferSchedulesToBarber(fromBarberId, toBarberId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}
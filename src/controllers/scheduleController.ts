import { Request, Response } from 'express';
import { ScheduleService } from '../services/ScheduleService';

export class ScheduleController {
    private scheduleService: ScheduleService;

    constructor() {
        this.scheduleService = new ScheduleService();
    }

    async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.scheduleService.createSchedule(req.body);
            res.status(201).json(schedule);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getAllSchedules(req: Request, res: Response): Promise<void> {
        try {
            const schedules = await this.scheduleService.getAllSchedules();
            res.status(200).json(schedules);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getScheduleById(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.scheduleService.getScheduleById(Number(req.params.id));
            res.status(200).json(schedule);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async updateSchedule(req: Request, res: Response): Promise<void> {
        try {
            const schedule = await this.scheduleService.updateSchedule(Number(req.params.id), req.body);
            res.status(200).json(schedule);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async deleteSchedule(req: Request, res: Response): Promise<void> {
        try {
            await this.scheduleService.deleteSchedule(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    // Nova funcionalidade: Transferir agendamentos entre barbeiros
    async transferSchedules(req: Request, res: Response): Promise<void> {
        try {
            const { fromBarberId, toBarberId } = req.body;
            const result = await this.scheduleService.transferSchedulesToBarber(fromBarberId, toBarberId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}
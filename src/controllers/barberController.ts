import { Request, Response } from 'express';
import { BarberService } from '../services/BarberService';

const barberService = new BarberService();

export const createBarber = async (req: Request, res: Response): Promise<void> => {
    try {
        const barber = await barberService.createBarber(req.body);
        res.status(201).json(barber);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const getAllBarbers = async (req: Request, res: Response): Promise<void> => {
    try {
        const barbers = await barberService.getAllBarbers();
        res.status(200).json(barbers);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const getBarberById = async (req: Request, res: Response): Promise<void> => {
    try {
        const barber = await barberService.getBarberById(Number(req.params.id));
        res.status(200).json(barber);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const updateBarber = async (req: Request, res: Response): Promise<void> => {
    try {
        const barber = await barberService.updateBarber(Number(req.params.id), req.body);
        res.status(200).json(barber);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const deleteBarber = async (req: Request, res: Response): Promise<void> => {
    try {
        await barberService.deleteBarber(Number(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};
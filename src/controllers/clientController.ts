import { Request, Response } from 'express';
import { ClientService } from '../services/ClientService';

const clientService = new ClientService();

export const createClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await clientService.createClient(req.body);
        res.status(201).json(client);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
    try {
        const clients = await clientService.getAllClients();
        res.status(200).json(clients);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await clientService.getClientById(Number(req.params.id));
        res.status(200).json(client);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await clientService.updateClient(Number(req.params.id), req.body);
        res.status(200).json(client);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
        await clientService.deleteClient(Number(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};
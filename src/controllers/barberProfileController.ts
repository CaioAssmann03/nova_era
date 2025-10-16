import { Request, Response } from 'express';
import { BarberProfileService } from '../services/BarberProfileService';

const barberProfileService = new BarberProfileService();

export const createOrUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId);
    const profileData = req.body;

    const profile = await barberProfileService.createOrUpdateProfile(barberId, profileData);
    res.status(201).json(profile);
  } catch (error: any) {
    if (error.message === 'Barbeiro não encontrado') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getProfileByBarberId = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId);
    const profile = await barberProfileService.getProfileByBarberId(barberId);
    
    if (!profile) {
      res.status(404).json({ error: 'Perfil não encontrado' });
      return;
    }

    res.status(200).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await barberProfileService.getAllProfiles();
    res.status(200).json(profiles);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const searchBySpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialty } = req.query;
    
    if (!specialty || typeof specialty !== 'string') {
      res.status(400).json({ error: 'Parâmetro specialty é obrigatório' });
      return;
    }

    const profiles = await barberProfileService.searchBySpecialty(specialty);
    res.status(200).json(profiles);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId);
    const { rating } = req.body;

    if (typeof rating !== 'number') {
      res.status(400).json({ error: 'Rating deve ser um número' });
      return;
    }

    const profile = await barberProfileService.updateRating(barberId, rating);
    res.status(200).json(profile);
  } catch (error: any) {
    if (error.message === 'Perfil não encontrado') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const barberId = parseInt(req.params.barberId);
    await barberProfileService.deleteProfile(barberId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Perfil não encontrado') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};
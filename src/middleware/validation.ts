import { Request, Response, NextFunction } from 'express';

// Middleware para validação de campos obrigatórios
export const validateBarber = (req: Request, res: Response, next: NextFunction): void => {
    const { name, email, phone } = req.body;
    
    if (!name || !email || !phone) {
        res.status(400).json({
            message: "Missing required fields: name, email, phone are required"
        });
        return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({
            message: "Invalid email format"
        });
        return;
    }
    
    next();
};

export const validateClient = (req: Request, res: Response, next: NextFunction): void => {
    const { name, email, phone } = req.body;
    
    if (!name || !email || !phone) {
        res.status(400).json({
            message: "Missing required fields: name, email, phone are required"
        });
        return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({
            message: "Invalid email format"
        });
        return;
    }
    
    next();
};

export const validateSchedule = (req: Request, res: Response, next: NextFunction): void => {
    const { barberId, clientId, appointmentTime } = req.body;
    
    if (!barberId || !clientId || !appointmentTime) {
        res.status(400).json({
            message: "Missing required fields: barberId, clientId, appointmentTime are required"
        });
        return;
    }
    
    // Validação básica de data
    const date = new Date(appointmentTime);
    if (isNaN(date.getTime())) {
        res.status(400).json({
            message: "Invalid date format for appointmentTime"
        });
        return;
    }
    
    // Verificar se a data não é no passado
    if (date < new Date()) {
        res.status(400).json({
            message: "Appointment time cannot be in the past"
        });
        return;
    }
    
    next();
};

export const validateBarberProfile = (req: Request, res: Response, next: NextFunction): void => {
    const { bio, specialties, experience, rating, workingHours } = req.body;
    
    // Validar experiência se fornecida
    if (experience !== undefined && (isNaN(experience) || experience < 0)) {
        res.status(400).json({
            message: "Experience must be a positive number"
        });
        return;
    }
    
    // Validar rating se fornecido
    if (rating !== undefined && (isNaN(rating) || rating < 0 || rating > 5)) {
        res.status(400).json({
            message: "Rating must be a number between 0 and 5"
        });
        return;
    }
    
    // Validar workingHours se fornecido
    if (workingHours !== undefined) {
        // Se é um objeto, converter para string JSON
        if (typeof workingHours === 'object') {
            try {
                req.body.workingHours = JSON.stringify(workingHours);
            } catch {
                res.status(400).json({
                    message: "Working hours object is invalid"
                });
                return;
            }
        } 
        // Se é uma string, verificar se é JSON válido
        else if (typeof workingHours === 'string') {
            try {
                JSON.parse(workingHours);
            } catch {
                res.status(400).json({
                    message: "Working hours must be valid JSON format"
                });
                return;
            }
        } else {
            res.status(400).json({
                message: "Working hours must be an object or JSON string"
            });
            return;
        }
    }
    
    next();
};

// Middleware para validação de parâmetros numéricos
export const validateNumericId = (req: Request, res: Response, next: NextFunction): void => {
    const id = parseInt(req.params.id || req.params.barberId);
    
    if (isNaN(id) || id <= 0) {
        res.status(400).json({
            message: "Invalid ID: must be a positive number"
        });
        return;
    }
    
    // Converter para número em ambos os parâmetros possíveis
    if (req.params.id) req.params.id = id.toString();
    if (req.params.barberId) req.params.barberId = id.toString();
    next();
};
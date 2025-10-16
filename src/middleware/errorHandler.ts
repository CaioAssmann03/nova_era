import { Request, Response, NextFunction } from 'express';

// Middleware para tratamento de erros global
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);

    // Erro de validação do TypeORM
    if (err.name === 'QueryFailedError') {
        res.status(400).json({
            message: 'Database validation error',
            details: err.message
        });
        return;
    }

    // Erro de entidade não encontrada
    if (err.name === 'EntityNotFound') {
        res.status(404).json({
            message: 'Resource not found'
        });
        return;
    }

    // Erro de sintaxe JSON
    if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
        res.status(400).json({
            message: 'Invalid JSON syntax'
        });
        return;
    }

    // Erro interno do servidor
    res.status(500).json({
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
};

// Middleware para rotas não encontradas
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};
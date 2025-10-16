import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './data-source';
import barberRoutes from './routes/barberRoutes';
import barberProfileRoutes from './routes/barberProfileRoutes';
import clientRoutes from './routes/clientRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

AppDataSource.initialize()
    .then(async () => {
        console.log('Database connected successfully');
        
        const app = express();
        const PORT = process.env.PORT || 3000;

        // Middleware
        app.use(express.json());

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.status(200).json({ 
                status: 'OK', 
                timestamp: new Date().toISOString(),
                database: 'Connected'
            });
        });

        // Routes
        console.log('Loading routes...');
        app.use('/api/barbers', barberRoutes);
        app.use('/api/barber-profiles', barberProfileRoutes);
        app.use('/api/clients', clientRoutes);
        app.use('/api/schedules', scheduleRoutes);
        app.use('/api/availability', availabilityRoutes);
        console.log('All routes loaded successfully');

        // Error handling middleware
        app.use(notFoundHandler);
        app.use(errorHandler);

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    })
    .catch(error => {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    });
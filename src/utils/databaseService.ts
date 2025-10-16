import { AppDataSource } from '../data-source';

class DatabaseService {
    private static instance: DatabaseService;
    private initialized = false;

    private constructor() {}

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async waitForInitialization(): Promise<void> {
        if (this.initialized) {
            return;
        }

        // Aguardar até que o AppDataSource esteja inicializado
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos timeout

        while (!AppDataSource.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        if (!AppDataSource.isInitialized) {
            throw new Error('Database initialization timeout');
        }

        this.initialized = true;
        console.log('✅ Database is ready for queries');
    }

    public isReady(): boolean {
        return this.initialized && AppDataSource.isInitialized;
    }
}

export const databaseService = DatabaseService.getInstance();
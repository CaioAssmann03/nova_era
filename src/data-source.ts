import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Barber } from './entity/Barber';
import { BarberProfile } from './entity/BarberProfile';
import { Client } from './entity/Client';
import { Schedule } from './entity/Schedule';

// Configuração baseada em variáveis de ambiente
const isProduction = process.env.NODE_ENV === 'production';
const dbType = process.env.DB_TYPE || 'sqlite';
const allowSync = process.env.DB_SYNCHRONIZE === 'true' || !isProduction;

let dataSourceConfig: any = {
    synchronize: allowSync,
    logging: false, // Desabilitar logs excessivos
    entities: [Barber, BarberProfile, Client, Schedule],
    migrations: [],
    subscribers: [],
};

if (dbType === 'postgres') {
    dataSourceConfig = {
        ...dataSourceConfig,
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'barbershop',
        password: process.env.DB_PASSWORD || 'barbershop123',
        database: process.env.DB_DATABASE || 'barbershop',
    };
} else {
    // SQLite por padrão
    const dbPath = process.env.DB_DATABASE || 'barbershop.sqlite';
    
    dataSourceConfig = {
        ...dataSourceConfig,
        type: 'sqlite',
        database: dbPath,
        dropSchema: false,
        synchronize: true, // Garantir criação de tabelas
    };
}

export const AppDataSource = new DataSource(dataSourceConfig);
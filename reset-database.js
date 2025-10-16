const { AppDataSource } = require('./dist/data-source');

async function resetDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('🗃️ Conectado ao banco de dados');
        
        // Deletar todas as tabelas na ordem correta
        await AppDataSource.query('DELETE FROM schedules;');
        await AppDataSource.query('DELETE FROM barber_profiles;');
        await AppDataSource.query('DELETE FROM barbers;');
        await AppDataSource.query('DELETE FROM clients;');
        
        // Reset auto-increment counters
        await AppDataSource.query('DELETE FROM sqlite_sequence;');
        
        console.log('✅ Banco de dados resetado!');
        console.log('🔢 Contadores de ID resetados para 1');
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Erro ao resetar banco:', error);
    }
}

resetDatabase();
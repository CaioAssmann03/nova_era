const { AppDataSource } = require('./dist/data-source');
const { Schedule } = require('./dist/entity/Schedule');
const { BarberProfile } = require('./dist/entity/BarberProfile');
const { Barber } = require('./dist/entity/Barber');
const { Client } = require('./dist/entity/Client');

async function clearAllData() {
    try {
        await AppDataSource.initialize();
        console.log('🗃️ Conectado ao banco de dados');
        
        // Deletar na ordem correta (relacionamentos)
        console.log('🗑️ Deletando agendamentos...');
        await AppDataSource.getRepository(Schedule).delete({});
        
        console.log('🗑️ Deletando perfis de barbeiros...');
        await AppDataSource.getRepository(BarberProfile).delete({});
        
        console.log('🗑️ Deletando barbeiros...');
        await AppDataSource.getRepository(Barber).delete({});
        
        console.log('🗑️ Deletando clientes...');
        await AppDataSource.getRepository(Client).delete({});
        
        console.log('✅ Todos os dados foram apagados!');
        console.log('🆕 Banco de dados limpo e pronto para novos dados');
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Erro ao limpar dados:', error);
    }
}

clearAllData();
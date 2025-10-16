const { AppDataSource } = require('./dist/data-source');
const { Schedule } = require('./dist/entity/Schedule');

async function cleanDuplicates() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');
        
        const scheduleRepository = AppDataSource.getRepository(Schedule);
        
        // Deletar agendamentos de teste (IDs 14, 15)
        await scheduleRepository.delete({ id: 14 });
        await scheduleRepository.delete({ id: 15 });
        
        console.log('✅ Agendamentos de teste removidos (IDs 14, 15)');
        
        // Listar agendamentos restantes
        const remaining = await scheduleRepository.find({
            relations: ['barber', 'client'],
            order: { appointmentTime: 'ASC' }
        });
        
        console.log('\n📋 Agendamentos restantes:');
        remaining.forEach(schedule => {
            console.log(`ID: ${schedule.id}, Time: ${schedule.appointmentTime}, Barber: ${schedule.barber?.id}`);
        });
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

cleanDuplicates();
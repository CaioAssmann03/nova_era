const { AppDataSource } = require('./dist/data-source');
const { Schedule } = require('./dist/entity/Schedule');

async function debugSchedules() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');
        
        const scheduleRepository = AppDataSource.getRepository(Schedule);
        
        // Buscar agendamentos do barbeiro 2
        const schedules = await scheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.barber', 'barber')
            .leftJoinAndSelect('schedule.client', 'client')
            .where('barber.id = :barberId', { barberId: 2 })
            .orderBy('schedule.appointmentTime', 'ASC')
            .getMany();
        
        console.log('\n=== AGENDAMENTOS BARBEIRO 2 ===');
        schedules.forEach(schedule => {
            console.log(`ID: ${schedule.id}`);
            console.log(`Appointment Time: ${schedule.appointmentTime}`);
            console.log(`Appointment Time Type: ${typeof schedule.appointmentTime}`);
            console.log(`Is Date: ${schedule.appointmentTime instanceof Date}`);
            console.log(`ISO String: ${schedule.appointmentTime instanceof Date ? schedule.appointmentTime.toISOString() : 'N/A'}`);
            console.log(`---`);
        });
        
        // Teste específico para horário duplicado
        const testDate = new Date('2025-10-16T12:00:00.000Z');
        console.log(`\n=== TESTE CONFLITO PARA ${testDate.toISOString()} ===`);
        
        const conflictingSchedule = await scheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.barber', 'barber')
            .where('barber.id = :barberId', { barberId: 2 })
            .andWhere('schedule.appointmentTime = :appointmentTime', { appointmentTime: testDate.toISOString() })
            .getOne();
        
        console.log('Conflicting schedule found:', conflictingSchedule ? conflictingSchedule.id : 'NONE');
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugSchedules();
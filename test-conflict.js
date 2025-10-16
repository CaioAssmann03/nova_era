const { AppDataSource } = require('./dist/data-source');
const { Schedule } = require('./dist/entity/Schedule');

async function testConflictValidation() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');
        
        const scheduleRepository = AppDataSource.getRepository(Schedule);
        
        // Simular a validação exata do ScheduleService
        const barberId = 2;
        const testTime = new Date('2025-10-16T12:00:00.000Z');
        
        // Converter da mesma forma que o ScheduleService
        const year = testTime.getFullYear();
        const month = String(testTime.getMonth() + 1).padStart(2, '0');
        const day = String(testTime.getDate()).padStart(2, '0');
        const hours = String(testTime.getHours()).padStart(2, '0');
        const minutes = String(testTime.getMinutes()).padStart(2, '0');
        const seconds = String(testTime.getSeconds()).padStart(2, '0');
        
        const appointmentTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
        
        console.log(`\n🔍 Testando validação:`);
        console.log(`Input Date: ${testTime}`);
        console.log(`Formatted String: ${appointmentTimeStr}`);
        console.log(`Timezone offset: ${testTime.getTimezoneOffset()} minutes`);
        
        // Buscar conflito da mesma forma que o ScheduleService
        const conflictingSchedule = await scheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.barber', 'barber')
            .where('barber.id = :barberId', { barberId })
            .andWhere('schedule.appointmentTime = :appointmentTime', { appointmentTime: appointmentTimeStr })
            .getOne();
        
        if (conflictingSchedule) {
            console.log(`❌ CONFLITO ENCONTRADO: Agendamento ID ${conflictingSchedule.id}`);
            console.log(`Appointment Time no banco: "${conflictingSchedule.appointmentTime}"`);
        } else {
            console.log(`✅ Nenhum conflito encontrado`);
        }
        
        // Testar também com horário local direto
        const localTime = new Date('2025-10-16 12:00:00');
        const localTimeStr = `${localTime.getFullYear()}-${String(localTime.getMonth() + 1).padStart(2, '0')}-${String(localTime.getDate()).padStart(2, '0')} ${String(localTime.getHours()).padStart(2, '0')}:${String(localTime.getMinutes()).padStart(2, '0')}:${String(localTime.getSeconds()).padStart(2, '0')}.000`;
        
        console.log(`\n🔍 Testando com horário local:`);
        console.log(`Local Date: ${localTime}`);
        console.log(`Local String: ${localTimeStr}`);
        
        const conflictingSchedule2 = await scheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.barber', 'barber')
            .where('barber.id = :barberId', { barberId })
            .andWhere('schedule.appointmentTime = :appointmentTime', { appointmentTime: localTimeStr })
            .getOne();
        
        if (conflictingSchedule2) {
            console.log(`❌ CONFLITO ENCONTRADO: Agendamento ID ${conflictingSchedule2.id}`);
        } else {
            console.log(`✅ Nenhum conflito encontrado`);
        }
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

testConflictValidation();
const { AppDataSource } = require('./dist/data-source');
const { ScheduleService } = require('./dist/services/ScheduleService');

async function testTimezoneValidation() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected\n');
        
        const scheduleService = new ScheduleService();
        
        // Teste 1: Horário que JÁ EXISTE no banco (deve dar conflito)
        console.log('=== TESTE 1: Horário ocupado ===');
        try {
            const conflictTime = new Date('2025-10-16T15:00:00.000Z'); // 15:00 UTC = 12:00 local
            console.log(`Testando: ${conflictTime.toISOString()} (UTC)`);
            console.log(`Local: ${conflictTime.toString()}`);
            
            const isAvailable = await scheduleService.isTimeSlotAvailable(2, conflictTime);
            console.log(`Resultado: ${isAvailable ? '✅ DISPONÍVEL' : '❌ OCUPADO'}`);
        } catch (error) {
            console.log(`Erro capturado: ${error.message}`);
        }
        
        // Teste 2: Horário que NÃO EXISTE no banco (deve estar disponível)
        console.log('\n=== TESTE 2: Horário livre ===');
        try {
            const freeTime = new Date('2025-10-16T17:00:00.000Z'); // 17:00 UTC = 14:00 local
            console.log(`Testando: ${freeTime.toISOString()} (UTC)`);
            console.log(`Local: ${freeTime.toString()}`);
            
            const isAvailable = await scheduleService.isTimeSlotAvailable(2, freeTime);
            console.log(`Resultado: ${isAvailable ? '✅ DISPONÍVEL' : '❌ OCUPADO'}`);
        } catch (error) {
            console.log(`Erro capturado: ${error.message}`);
        }
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

testTimezoneValidation();
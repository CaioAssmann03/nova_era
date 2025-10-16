// Debug de timezone
const utcTime = new Date('2025-10-16T15:00:00.000Z');
console.log('UTC Input:', utcTime.toISOString());
console.log('Local toString:', utcTime.toString());

// Teste da lógica de conversão
const appointmentTimeStr = utcTime.toISOString();
console.log('ISO String:', appointmentTimeStr);
console.log('Ends with Z:', appointmentTimeStr.endsWith('Z'));

if (appointmentTimeStr.endsWith('Z')) {
    const timeWithoutTZ = appointmentTimeStr.replace('T', ' ').replace('.000Z', '');
    console.log('Time without TZ:', timeWithoutTZ);
    const localTime = new Date(timeWithoutTZ);
    console.log('New local time:', localTime.toString());
    console.log('New local ISO:', localTime.toISOString());
}

// O que realmente queremos
console.log('\n=== O que queremos ===');
console.log('Banco tem: 2025-10-16 12:00:00.000');
console.log('Input UTC: 2025-10-16T15:00:00.000Z (que é 12:00 local)');
console.log('Devemos comparar: 2025-10-16 12:00:00.000');

// Solução correta: usar getTimezoneOffset
const utcTime2 = new Date('2025-10-16T15:00:00.000Z');
const offsetMinutes = utcTime2.getTimezoneOffset();
const localTime2 = new Date(utcTime2.getTime() - (offsetMinutes * 60 * 1000));
console.log('Offset minutes:', offsetMinutes);
console.log('Corrected local time:', localTime2.toISOString());
console.log('Local format:', localTime2.toISOString().replace('T', ' ').replace('.000Z', '.000'));
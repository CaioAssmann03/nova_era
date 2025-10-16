import { Request, Response } from 'express';
import { ScheduleService } from '../services/ScheduleService';
import { BarberProfileService } from '../services/BarberProfileService';

const scheduleService = new ScheduleService();
const barberProfileService = new BarberProfileService();

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId, date } = req.query;
    
    if (!barberId || !date) {
      res.status(400).json({ error: 'barberId e date são obrigatórios' });
      return;
    }

    const barberIdNum = parseInt(barberId as string);
    if (isNaN(barberIdNum) || barberIdNum <= 0) {
      res.status(400).json({ error: 'barberId deve ser um número positivo' });
      return;
    }

    const targetDate = new Date(date as string);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Formato de data inválido' });
      return;
    }

    // Buscar perfil do barbeiro para verificar horários de trabalho
    const profile = await barberProfileService.getProfileByBarberId(barberIdNum);
    
    if (!profile || !profile.workingHours) {
      res.status(400).json({ 
        error: 'Barbeiro não possui horários de trabalho definidos',
        availableSlots: []
      });
      return;
    }

    const workingHours = JSON.parse(profile.workingHours);
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayName = dayNames[targetDate.getDay()];
    
    const daySchedule = workingHours[dayName];
    if (!daySchedule || daySchedule === 'fechado') {
      res.status(200).json({
        message: 'Barbeiro não trabalha neste dia',
        availableSlots: []
      });
      return;
    }

    // Gerar slots disponíveis baseado no horário de trabalho
    const [startTime, endTime] = daySchedule.split('-');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const slots = [];
    const currentSlot = new Date(targetDate);
    currentSlot.setHours(startHour, startMinute, 0, 0);
    
    const endSlot = new Date(targetDate);
    endSlot.setHours(endHour, endMinute, 0, 0);

    // Gerar slots de 1 hora
    while (currentSlot < endSlot) {
        // Verificar se o slot está no futuro
        if (currentSlot > new Date()) {
          // Verificar se o barbeiro está disponível neste horário
          const isWorking = await barberProfileService.isBarberWorking(barberIdNum, currentSlot);
          
          if (isWorking) {
            // Verificar se já existe agendamento
            const isAvailable = await checkSlotAvailability(barberIdNum, currentSlot);
            
            if (isAvailable) {
              slots.push({
                time: currentSlot.toISOString(),
                formatted: formatTime(currentSlot)
              });
            }
          }
        }      // Próximo slot (1 hora depois)
      currentSlot.setHours(currentSlot.getHours() + 1);
    }

    res.status(200).json({
      barberId: barberIdNum,
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek: dayName,
      workingHours: daySchedule,
      availableSlots: slots
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Função auxiliar para verificar disponibilidade do slot
async function checkSlotAvailability(barberId: number, appointmentTime: Date): Promise<boolean> {
  return await scheduleService.isTimeSlotAvailable(barberId, appointmentTime);
}

// Função auxiliar para formatar horário
function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
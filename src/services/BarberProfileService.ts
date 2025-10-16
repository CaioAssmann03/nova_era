import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { BarberProfile } from '../entity/BarberProfile';
import { Barber } from '../entity/Barber';

export class BarberProfileService {
  private barberProfileRepository: Repository<BarberProfile>;
  private barberRepository: Repository<Barber>;

  constructor() {
    this.barberProfileRepository = AppDataSource.getRepository(BarberProfile);
    this.barberRepository = AppDataSource.getRepository(Barber);
  }

  async createOrUpdateProfile(barberId: number, profileData: Partial<BarberProfile>): Promise<BarberProfile> {
    // Verificar se o barbeiro existe
    const barber = await this.barberRepository.findOneBy({ id: barberId });
    if (!barber) {
      throw new Error('Barbeiro não encontrado');
    }

    // Validar horários de trabalho se fornecidos
    if (profileData.workingHours) {
      this.validateWorkingHours(profileData.workingHours);
    }

    // Verificar se já existe um perfil para este barbeiro
    let profile = await this.barberProfileRepository.findOne({
      where: { barber: { id: barberId } },
      relations: ['barber']
    });

    if (profile) {
      // Atualizar perfil existente
      Object.assign(profile, profileData);
    } else {
      // Criar novo perfil
      profile = this.barberProfileRepository.create({
        ...profileData,
        barber
      });
    }

    return await this.barberProfileRepository.save(profile);
  }

  async getProfileByBarberId(barberId: number): Promise<BarberProfile | null> {
    return await this.barberProfileRepository.findOne({
      where: { barber: { id: barberId } },
      relations: ['barber']
    });
  }

  async getAllProfiles(): Promise<BarberProfile[]> {
    return await this.barberProfileRepository.find({
      relations: ['barber']
    });
  }

  async searchBySpecialty(specialty: string): Promise<BarberProfile[]> {
    return await this.barberProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.barber', 'barber')
      .where('profile.specialties LIKE :specialty', { specialty: `%${specialty}%` })
      .getMany();
  }

  async updateRating(barberId: number, rating: number): Promise<BarberProfile> {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating deve estar entre 0 e 5');
    }

    const profile = await this.getProfileByBarberId(barberId);
    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    profile.rating = rating;
    return await this.barberProfileRepository.save(profile);
  }

  async deleteProfile(barberId: number): Promise<void> {
    const profile = await this.getProfileByBarberId(barberId);
    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    await this.barberProfileRepository.remove(profile);
  }

  // Validar formato dos horários de trabalho
  private validateWorkingHours(workingHours: string): void {
    try {
      const hours = JSON.parse(workingHours);
      
      // Verificar se é um objeto
      if (typeof hours !== 'object' || hours === null) {
        throw new Error('Horários de trabalho devem ser um objeto JSON válido');
      }

      // Validar cada dia da semana
      const validDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
      const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)-([01]?\d|2[0-3]):([0-5]\d)$/;
      
      for (const [day, time] of Object.entries(hours)) {
        if (!validDays.includes(day.toLowerCase())) {
          throw new Error(`Dia inválido: ${day}. Use: ${validDays.join(', ')}`);
        }
        
        if (time !== 'fechado' && !timePattern.test(time as string)) {
          throw new Error(`Horário inválido para ${day}. Use formato HH:MM-HH:MM ou "fechado"`);
        }
      }
    } catch (error: any) {
      if (error.name === 'SyntaxError') {
        throw new Error('Formato JSON inválido para horários de trabalho');
      }
      throw error;
    }
  }

  // Verificar se barbeiro está trabalhando em determinado horário
  async isBarberWorking(barberId: number, appointmentTime: Date): Promise<boolean> {
    const profile = await this.getProfileByBarberId(barberId);
    if (!profile || !profile.workingHours) {
      return true; // Se não tem horário definido, assume que trabalha
    }

    try {
      const workingHours = JSON.parse(profile.workingHours);
      const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      const appointmentDay = dayNames[appointmentTime.getDay()];
      
      const daySchedule = workingHours[appointmentDay];
      if (!daySchedule || daySchedule === 'fechado') {
        return false;
      }

      // Extrair horário de início e fim
      const [startTime, endTime] = daySchedule.split('-');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      // Verificar se o horário do agendamento está dentro do expediente
      const appointmentHour = appointmentTime.getHours();
      const appointmentMinute = appointmentTime.getMinutes();
      
      const appointmentMinutes = appointmentHour * 60 + appointmentMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes;
    } catch (error) {
      console.error('Erro ao validar horário de trabalho:', error);
      return true; // Em caso de erro, permite o agendamento
    }
  }
}
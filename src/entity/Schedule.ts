import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Barber } from './Barber';
import { Client } from './Client';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    type: 'datetime',
    transformer: {
      to: (value: Date) => {
        if (!value) return null;
        // Salva como ISO string sem conversão de timezone
        return value.toISOString();
      },
      from: (value: string) => {
        if (!value) return null;
        // Recupera como Date mantendo o horário original
        return new Date(value);
      }
    }
  })
  appointmentTime!: Date;

  @ManyToOne(() => Barber, barber => barber.schedules, { 
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'barberId' })
  barber!: Barber;

  @ManyToOne(() => Client, client => client.schedules, { 
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'clientId' })
  client!: Client;
}
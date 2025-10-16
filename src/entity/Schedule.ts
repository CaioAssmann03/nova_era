import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Barber } from './Barber';
import { Client } from './Client';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' }) // SQLite usa 'text' para datetime
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
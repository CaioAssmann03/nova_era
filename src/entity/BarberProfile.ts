import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Barber } from './Barber';

@Entity('barber_profiles')
export class BarberProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  specialties?: string;

  @Column({ nullable: true, comment: 'Years of experience' })
  experience?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, default: 0.00 })
  rating?: number;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true, comment: 'JSON string with working hours' })
  workingHours?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Barber, barber => barber.profile, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn()
  barber!: Barber;
}
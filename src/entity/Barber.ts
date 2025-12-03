import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Schedule } from './Schedule';
import { BarberProfile } from './BarberProfile';

@Entity('barbers')
export class Barber {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  phone!: string;

  @OneToMany(() => Schedule, schedule => schedule.barber)
  schedules?: Schedule[];

  @OneToOne(() => BarberProfile, profile => profile.barber, { 
    cascade: true, 
    eager: true 
  })
  profile?: BarberProfile;
}
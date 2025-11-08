// FILE: src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  orcid: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  googleScholar: string;

  @Column({ type: 'text', nullable: true })
  snip: string;

  @Column({ type: 'simple-json', nullable: true })
  publications: any;

  @Column({ type: 'simple-json', nullable: true })
  courses: any;

  @Column({ type: 'simple-json', nullable: true })
  milestones: any;

  @Column({ unique: true })
  publicId: string = uuidv4();

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// FILE: src/entities/user.entity.ts
import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  orcid?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'longtext', nullable: true })
  photoUrl?: string;

  @Column({ type: 'simple-json', nullable: true })
  gallery?: string[];

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  googleScholar?: string;

  @Column({ type: 'text', nullable: true })
  snip?: string;

  @Column({ type: 'simple-json', nullable: true })
  publications?: Record<string, any>[];

  @Column({ type: 'simple-json', nullable: true })
  courses?: Record<string, any>[];

  @Column({ type: 'simple-json', nullable: true })
  milestones?: Record<string, any>[];
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(userData);
    return this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  async update(id: number, changes: Partial<User>): Promise<User | null> {
    await this.usersRepo.update(id, changes);
    return this.findOne(id); // devuelve la entidad actualizada (o null si no existe)
  }

  async delete(id: number): Promise<void> {
    await this.usersRepo.delete(id);
  }
}

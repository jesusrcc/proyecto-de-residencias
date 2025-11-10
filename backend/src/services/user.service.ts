// FILE: src/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BaseService } from './app.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {
    super(userRepo);
  }

  // Aquí puedes agregar métodos específicos de usuarios si los necesitas
  // Ejemplo:
  // async findByEmail(email: string): Promise<User | null> {
  //   return this.userRepo.findOne({ where: { email } });
  // }
}

// FILE: src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() {
    return this.repo.find();
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email }});
  }

  findByPublicId(publicId: string) {
    return this.repo.findOne({ where: { publicId }});
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }});
  }

  async create(payload: Partial<User>) {
    const user = this.repo.create({
      ...payload,
      publicId: payload.publicId || uuidv4()
    });
    return this.repo.save(user);
  }

  async update(id: number, payload: Partial<User>) {
    await this.repo.update(id, payload);
    return this.findOne(id);
  }

  async upsertByEmail(email: string, payload: Partial<User>) {
    let u = await this.findByEmail(email);
    if (!u) {
      u = await this.create({ email, ...payload });
    } else {
      await this.update(u.id, payload);
      u = await this.findOne(u.id);
    }
    return u;
  }
}

// FILE: src/common/base.service.ts
import { Injectable } from '@nestjs/common';
import { Repository, ObjectLiteral, DeepPartial } from 'typeorm';

@Injectable()
export class BaseService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}

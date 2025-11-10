// FILE: src/common/base.controller.ts
import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ObjectLiteral, DeepPartial } from 'typeorm';
import { BaseService } from '../services/app.service';

export class BaseController<T extends ObjectLiteral> {
  constructor(protected readonly baseService: BaseService<T>) {}

  @Get()
  async findAll() {
    return this.baseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const item = await this.baseService.findOne(id);
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);
    return item;
  }

  @Post()
  async create(@Body() data: DeepPartial<T>) {
    return this.baseService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: DeepPartial<T>) {
    const updated = await this.baseService.update(id, data);
    if (!updated) throw new NotFoundException(`Item with id ${id} not found`);
    return updated;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const deleted = await this.baseService.delete(id);
    if (!deleted) throw new NotFoundException(`Item with id ${id} not found`);
    return { success: true };
  }
}

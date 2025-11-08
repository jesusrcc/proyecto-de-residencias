// FILE: src/users/users.controller.ts
import { Controller, Get, Post, Put, Query, Param, Body, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get()
  async list(@Query('email') email?: string) {
    if (email) {
      const u = await this.svc.findByEmail(email);
      return u ? [u] : [];
    }
    return this.svc.findAll();
  }

  @Post()
  async create(@Body() payload: any) {
    const u = await this.svc.create(payload);
    return u;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: any) {
    const userId = parseInt(id, 10);
    const exists = await this.svc.findOne(userId);
    if (!exists) throw new NotFoundException('Usuario no encontrado');
    const updated = await this.svc.update(userId, payload);
    return updated;
  }
}

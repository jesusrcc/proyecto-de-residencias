// FILE: src/controllers/user.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { BaseController } from './app.controller';
import { Public } from '../common/public.decorator';

@Controller('api/users')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Public() // ✅ Evita el JwtAuthGuard
  @Get('public/:id')
  async getPublicProfile(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    if (!user) return { message: 'User not found' };

    delete (user as any).password;
    delete (user as any).token;
    return user;
  }
}

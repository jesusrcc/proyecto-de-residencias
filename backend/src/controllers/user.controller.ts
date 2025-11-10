// FILE: src/controllers/user.controller.ts
import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { BaseController } from './app.controller';

@Controller('api/users')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // Aquí puedes agregar endpoints personalizados
  // Ejemplo:
  // @Get('email/:email')
  // async getByEmail(@Param('email') email: string) {
  //   return this.userService.findByEmail(email);
  // }
}

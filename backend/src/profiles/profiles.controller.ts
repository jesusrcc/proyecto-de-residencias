// src/profiles/profiles.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private usersSvc: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) return null;
    const u = await this.usersSvc.findOne(userId);
    return u;
  }
}

// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { name, email, password } = body;
    // AuthService.register debe devolver { user, token } o lanzar error
    const res = await this.svc.register(name, email, password);
    return { ok: true, user: res.user, token: res.token };
  }

  // POST /auth/login
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    // AuthService.login debe devolver { user, token } o lanzar UnauthorizedException
    const res = await this.svc.login(email, password);
    return { ok: true, user: res.user, token: res.token };
  }
}

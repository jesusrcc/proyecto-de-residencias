import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      country?: string;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.firstName,
      body.lastName,
      body.country,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}

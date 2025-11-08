// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usersSvc: UsersService, private jwt: JwtService) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.usersSvc.findByEmail(email);
    if (existing) throw new Error('Usuario ya existe');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.usersSvc.create({ email, name, passwordHash: hash });
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersSvc.findByEmail(email);
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user, token };
  }
}

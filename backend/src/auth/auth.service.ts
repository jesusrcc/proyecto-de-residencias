import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** ✅ Registro */
  async register(email: string, password: string, name?: string, firstName?: string, lastName?: string, country?: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      passwordHash: hashed,
      name,
      firstName,
      lastName,
      country,
    });

    await this.userRepo.save(user);
    const token = await this.signToken(user);
    return { user, token };
  }

  /** ✅ Login */
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({
        error: 'USER_NOT_FOUND',
        message: 'El correo no está registrado.',
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) {
      throw new UnauthorizedException({
        error: 'INVALID_PASSWORD',
        message: 'La contraseña es incorrecta.',
      });
    }

    const token = await this.signToken(user);
    return { user, token };
  }

  private async signToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}

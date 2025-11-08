// FILE: src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';

import { ProfilesController } from './profiles/profiles.controller';
import { PublicController } from './public/public.controller';
import { UploadController } from './upload/upload.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER, // leemos de .env (sin default peligroso)
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'mi_proyecto_db',
      entities: [User],
      autoLoadEntities: true,
      synchronize: true, // SOLO en desarrollo
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [ProfilesController, PublicController, UploadController],
})
export class AppModule {}

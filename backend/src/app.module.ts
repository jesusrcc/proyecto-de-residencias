// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Con autoLoadEntities: true suele bastar si registras entidades con forFeature en los módulos.
    // Dejo también `entities: [User]` para evitar warnings/errores si TypeORM no detecta la entidad.
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'Puchunga11',
      database:
        process.env.DB_NAME || process.env.DB_DATABASE || 'mi_proyecto_db',
      entities: [User],
      autoLoadEntities: true,
      synchronize: true, // SOLO en desarrollo
    }),

    // <-- IMPORTANT: el módulo UsersModule debe estar en imports si lo importaste arriba
    UsersModule,
  ],
})
export class AppModule {}

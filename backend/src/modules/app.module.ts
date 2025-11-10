// FILE: src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
      entities: [],
      autoLoadEntities: true,
      synchronize: true, // SOLO en desarrollo
    }),
  ],
  controllers: [],
})
export class AppModule {}

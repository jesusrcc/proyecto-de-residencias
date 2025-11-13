// src/main.ts
import * as path from 'path';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';  // ⬅ AGREGADO

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('Verificando variables de entorno:');
console.log('DB_HOST =', process.env.DB_HOST);
console.log('DB_USER =', process.env.DB_USER);
console.log('DB_PASSWORD =', process.env.DB_PASSWORD ? '(oculta)' : '(vacía)');
console.log('DB_NAME =', process.env.DB_NAME);

async function bootstrap() {
  console.log(' Iniciando servidor con base de datos:', process.env.DB_NAME);
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // ⬅⬅⬅ AUMENTAR LÍMITE PARA BASE64 / IMÁGENES
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // habilitar validación automática usando DTOs y class-validator
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(` Servidor corriendo en http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error arrancando aplicación:', err);
  process.exit(1);
});

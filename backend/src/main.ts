import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // servir carpeta uploads (si la usas)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
}
bootstrap().catch((err: any) => console.error(err));

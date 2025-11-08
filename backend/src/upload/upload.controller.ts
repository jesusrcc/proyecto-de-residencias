// FILE: src/upload/upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
  @Post('photo')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const name = uuidv4() + extname(file.originalname);
        cb(null, name);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { ok: false };
    const url = `${process.env.APP_PUBLIC_BASE || 'http://localhost:3000'}/uploads/${file.filename}`;
    return { ok: true, url };
  }
}

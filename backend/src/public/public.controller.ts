// FILE: src/public/public.controller.ts
import { Controller, Get, Param, NotFoundException, Res } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Response } from 'express';

@Controller('public')
export class PublicController {
  constructor(private usersSvc: UsersService) {}

  @Get(':publicId')
  async show(@Param('publicId') publicId: string, @Res() res: Response) {
    const u = await this.usersSvc.findByPublicId(publicId);
    if (!u) throw new NotFoundException('Perfil no encontrado');

    const html = `
      <html>
      <head><meta charset="utf-8"><title>${u.firstName || u.name} ${u.lastName || ''}</title></head>
      <body style="font-family:Arial;padding:20px;">
        <div style="display:flex; gap:20px;">
          <div style="width:220px;">
            <img src="${u.photoUrl || '/uploads/placeholder.png'}" style="width:200px;height:200px;object-fit:cover;border-radius:6px"/>
            <h2>${u.firstName || u.name}</h2>
            <div>${u.country || ''}</div>
            <div>${u.orcid ? 'ORCID: ' + u.orcid : ''}</div>
            ${u.googleScholar ? `<div><a href="${u.googleScholar}" target="_blank">Google Scholar</a></div>` : ''}
          </div>
          <div style="flex:1">
            <h1>Trayectoria académica</h1>
            <p>${u.bio || ''}</p>
            <h3>Publicaciones</h3>
            <ol>${(u.publications || []).map((p:any) => `<li>${p.title || ''} ${p.journal ? ', ' + p.journal : ''} ${p.year ? ' — ' + p.year : ''}</li>`).join('')}</ol>
            <h3>Cursos</h3>
            <ul>${(u.courses || []).map((c:any) => `<li>${c.name} ${c.institution ? ' — ' + c.institution : ''}</li>`).join('')}</ul>
          </div>
        </div>
      </body>
      </html>
    `;
    res.type('html').send(html);
  }
}

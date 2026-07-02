import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createInvitationDto: CreateInvitationDto, @Request() req) {
    return this.invitationsService.create(createInvitationDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Request() req) {
    return this.invitationsService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash/list')
  findTrash(@Request() req) {
    return this.invitationsService.findTrashByUser(req.user.id);
  }

  /**
   * Public OG önizleme sayfası — WhatsApp/Telegram link paylaşılınca bu HTML'i okur,
   * başlık + görsel kartı gösterir; gerçek ziyaretçi anında davet sayfasına yönlenir.
   */
  @Get('og/:slug')
  async ogPreview(@Param('slug') slug: string, @Res() res: any) {
    const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    let title = 'Davetiye';
    let desc = 'Sizi aramızda görmekten mutluluk duyarız.';
    let image = '';
    const target = (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/+$/, '') + '/davet/' + encodeURIComponent(slug);
    try {
      const inv: any = await this.invitationsService.findOneBySlug(slug).catch(() => null);
      if (inv) {
        title = inv.title || title;
        const cfg: any = inv.config || {};
        if (cfg.message) desc = String(cfg.message).slice(0, 160);
        const first = Array.isArray(cfg.photos) ? cfg.photos[0] : null;
        const url = typeof first === 'string' ? first : first?.url;
        if (url && /^https?:\/\//.test(url)) image = url;
      }
    } catch { /* şifre korumalı ya da bulunamadı → jenerik kart */ }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)} 💌">
<meta property="og:description" content="${esc(desc)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta property="og:url" content="${esc(target)}">
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
</head><body>Yönlendiriliyorsunuz… <a href="${esc(target)}">Davetiyeyi aç</a></body></html>`);
  }

  @Post(':slug')
  findOne(@Param('slug') slug: string, @Body('password') password?: string) {
    return this.invitationsService.findOneBySlug(slug, password);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restore(@Param('id') id: string, @Request() req) {
    return this.invitationsService.restore(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvitationDto: UpdateInvitationDto, @Request() req) {
    return this.invitationsService.update(id, updateInvitationDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.invitationsService.remove(id, req.user.id);
  }
}

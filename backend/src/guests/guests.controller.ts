import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  // Herkes RSVP bırakabilir (Public) — IP başına dakikada 5 yanıt (spam koruması)
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestsService.create(createGuestDto);
  }

  // Sadece davetiye sahibi misafirleri görebilir
  @UseGuards(JwtAuthGuard)
  @Get('invitation/:invitationId')
  findAllByInvitation(@Param('invitationId') invitationId: string, @Request() req) {
    return this.guestsService.findAllByInvitation(invitationId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.guestsService.remove(id, req.user.id);
  }
}

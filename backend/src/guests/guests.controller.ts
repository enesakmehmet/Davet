import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  // Herkes RSVP bırakabilir (Public)
  @Post()
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

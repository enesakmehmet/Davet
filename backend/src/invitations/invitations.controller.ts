import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
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

  @Post(':slug')
  findOne(@Param('slug') slug: string, @Body('password') password?: string) {
    return this.invitationsService.findOneBySlug(slug, password);
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

import { Controller, Put, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EditorService } from './editor.service';
import { AutosaveDto } from './dto/autosave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @UseGuards(JwtAuthGuard)
  @Put('autosave')
  autosave(@Body() autosaveDto: AutosaveDto, @Request() req) {
    return this.editorService.autosave(autosaveDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('versions/:invitationId')
  getVersions(@Param('invitationId') invitationId: string, @Request() req) {
    return this.editorService.getVersions(invitationId, req.user.id);
  }
}

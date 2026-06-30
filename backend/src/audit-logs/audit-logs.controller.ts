import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async getMyLogs(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.auditLogsService.getUserLogs(userId, page, limit);
  }

  @Get('entity/:entityType/:entityId')
  async getEntityLogs(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @GetUser('id') userId: string,
  ) {
    return this.auditLogsService.getEntityLogs(entityType, entityId, userId);
  }

  @Get('stats')
  async getMyStats(@GetUser('id') userId: string) {
    return this.auditLogsService.getUserStats(userId);
  }
}

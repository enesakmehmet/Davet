import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAccessGuard } from '../auth/guards/admin-access.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SendNotificationDto } from './dto/send-notification.dto';

/** Sadece "admin" rolü — "moderator" bu uçlara giremez (kullanıcı/ödeme/denetim/davetiye silme vb.) */
const AdminOnly = () => UseGuards(RolesGuard);

@Controller('admin')
@UseGuards(AdminAccessGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @AdminOnly() @Roles('admin')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('pageviews')
  @AdminOnly() @Roles('admin')
  async getPageViews() {
    return this.adminService.getPageViewStats();
  }

  @Get('whatsapp-clicks')
  @AdminOnly() @Roles('admin')
  async getWhatsappClicks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getWhatsappClicks(page, limit);
  }

  @Get('leads')
  @AdminOnly() @Roles('admin')
  async getLeads(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getLeads(page, limit);
  }

  @Get('search')
  @AdminOnly() @Roles('admin')
  async globalSearch(@Query('q') q: string) {
    return this.adminService.globalSearch(q || '');
  }

  @Get('users')
  @AdminOnly() @Roles('admin')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  @Get('users/:id')
  @AdminOnly() @Roles('admin')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/status')
  @AdminOnly() @Roles('admin')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Patch('users/:id/role')
  @AdminOnly() @Roles('admin')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Get('trends')
  @AdminOnly() @Roles('admin')
  async getTrends() {
    return this.adminService.getTrends();
  }

  @Get('templates')
  async getAllTemplates(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllTemplates(page, limit, status);
  }

  @Patch('templates/:id/approve')
  async approveTemplate(@Param('id') id: string) {
    return this.adminService.approveTemplate(id);
  }

  @Patch('templates/:id/reject')
  async rejectTemplate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectTemplate(id, reason);
  }

  @Get('payments')
  @AdminOnly() @Roles('admin')
  async getAllPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllPayments(page, limit);
  }

  @Get('audit-logs')
  @AdminOnly() @Roles('admin')
  async getAllAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAllAuditLogs(page, limit, userId, action);
  }

  @Delete('users/:id')
  @AdminOnly() @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('invitations')
  @AdminOnly() @Roles('admin')
  async getAllInvitations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllInvitations(page, limit, search);
  }

  @Get('invitations/trash')
  @AdminOnly() @Roles('admin')
  async getTrashedInvitations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getTrashedInvitations(page, limit, search);
  }

  @Patch('invitations/:id/restore')
  @AdminOnly() @Roles('admin')
  async restoreInvitation(@Param('id') id: string) {
    return this.adminService.restoreInvitation(id);
  }

  @Get('invitations/:id/guests')
  @AdminOnly() @Roles('admin')
  async getInvitationGuests(@Param('id') id: string) {
    return this.adminService.getInvitationGuests(id);
  }

  @Delete('invitations/:id')
  @AdminOnly() @Roles('admin')
  async removeInvitation(@Param('id') id: string) {
    return this.adminService.removeInvitation(id);
  }

  @Get('guest-photos')
  async getGuestPhotos(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getGuestPhotos(page, limit, search);
  }

  @Delete('guest-photos/:id')
  async removeGuestPhoto(@Param('id') id: string) {
    return this.adminService.removeGuestPhoto(id);
  }

  @Get('notifications')
  @AdminOnly() @Roles('admin')
  async getAllNotifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllNotifications(page, limit, search);
  }

  @Post('notifications')
  @AdminOnly() @Roles('admin')
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.adminService.sendNotification(dto.title, dto.content, dto.userId);
  }
}

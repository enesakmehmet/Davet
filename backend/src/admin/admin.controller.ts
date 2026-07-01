import {
  Controller,
  Get,
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

@Controller('admin')
@UseGuards(AdminAccessGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('pageviews')
  async getPageViews() {
    return this.adminService.getPageViewStats();
  }

  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Get('trends')
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
  async getAllPayments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getAllPayments(page, limit);
  }

  @Get('audit-logs')
  async getAllAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAllAuditLogs(page, limit, userId, action);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('invitations')
  async getAllInvitations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllInvitations(page, limit, search);
  }

  @Get('invitations/:id/guests')
  async getInvitationGuests(@Param('id') id: string) {
    return this.adminService.getInvitationGuests(id);
  }

  @Delete('invitations/:id')
  async removeInvitation(@Param('id') id: string) {
    return this.adminService.removeInvitation(id);
  }
}

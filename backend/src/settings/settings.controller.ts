import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@GetUser('id') userId: string) {
    return this.settingsService.getUserSettings(userId);
  }

  @Patch()
  async updateSettings(
    @GetUser('id') userId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(userId, updateSettingsDto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(userId, changePasswordDto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@GetUser('id') userId: string) {
    return this.settingsService.deleteAccount(userId);
  }

  @Get('export')
  async exportData(@GetUser('id') userId: string) {
    return this.settingsService.exportUserData(userId);
  }
}

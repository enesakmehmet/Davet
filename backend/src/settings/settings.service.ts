import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Notification preferences ve diğer ayarlar için ayrı bir Settings tablosu eklenebilir
    // Şimdilik user bilgileriyle dönüyoruz
    return {
      ...user,
      emailNotifications: true, // Default değerler, Settings tablosu eklenince buradan gelecek
      marketingEmails: false,
      language: 'tr',
      timezone: 'Europe/Istanbul',
    };
  }

  async updateSettings(userId: string, updateSettingsDto: UpdateSettingsDto) {
    const { email, name, ...preferences } = updateSettingsDto;

    // Email değişikliği varsa unique kontrolü yap
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: email || undefined,
        name: name || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    // Preferences için ayrı bir tablo kullanılabilir
    return {
      message: 'Ayarlar güncellendi',
      user: {
        ...user,
        ...preferences,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Mevcut şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mevcut şifre yanlış');
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        refreshToken: null, // Refresh token'ı iptal et
      },
    });

    return {
      message: 'Şifre başarıyla değiştirildi',
    };
  }

  async deleteAccount(userId: string) {
    // Kullanıcı ve ilişkili tüm verileri sil (cascade delete ayarlanmış)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Hesap başarıyla silindi',
    };
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        invitations: true,
        templates: true,
        payments: true,
        subscriptions: true,
        notifications: true,
        auditLogs: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Hassas bilgileri çıkar
    const { passwordHash, refreshToken, ...userData } = user;

    return {
      message: 'Kullanıcı verileri dışa aktarıldı',
      data: userData,
    };
  }
}

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

    // E-posta buradan DEĞİŞTİRİLEMEZ. Eskiden bu uç noktadan hesap e-postası herhangi bir adrese
    // doğrulamasız geçirilebiliyordu: kayıttaki 6 haneli kod doğrulaması ve geçici/sahte e-posta
    // kontrolü tamamen atlanıyordu; başkasına ait bir adres alınıp o kişinin kayıt olması
    // engellenebiliyordu. Doğrulamalı e-posta değişikliği akışı eklenene kadar yalnızca
    // aynı adresin gönderilmesine (ör. formun tamamının kaydedilmesi) izin veriliyor.
    if (email) {
      const current = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (!current) throw new NotFoundException('Kullanıcı bulunamadı');
      if (email.trim().toLowerCase() !== current.email.trim().toLowerCase()) {
        throw new BadRequestException('E-posta adresi şu an panelden değiştirilemiyor. Değişiklik için iletişim sayfasından bize yazabilirsin.');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || undefined,
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

  async deleteAccount(userId: string, password?: string) {
    // Geri dönüşü olmayan işlem: mevcut şifre ŞART. Eskiden sadece geçerli bir oturum yetiyordu;
    // açık kalmış bir oturumla (ortak bilgisayar, çalınmış token) hesap ve tüm davetler silinebilirdi.
    const owner = await this.prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!owner) throw new NotFoundException('Kullanıcı bulunamadı');
    if (!password || !(await bcrypt.compare(password, owner.passwordHash))) {
      throw new UnauthorizedException('Hesabı silmek için mevcut şifreni doğru girmelisin.');
    }

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
    // Kimlik bilgisi niteliğindeki alanlar indirilen dosyaya girmesin (dosya e-postayla
    // paylaşılabilir/bulutta kalabilir; içindeki geçerli bir sıfırlama kodu hesabı açar).
    const { passwordHash, refreshToken, resetToken, resetTokenExpires, verifyToken, verifyTokenExpires, ...userData } = user as any;

    return {
      message: 'Kullanıcı verileri dışa aktarıldı',
      data: userData,
    };
  }
}

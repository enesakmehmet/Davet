import { Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notif = await this.prisma.notification.create({
      data: createNotificationDto,
    });
    // Kullanıcının kayıtlı Expo push token'ı varsa telefona da gönder (best-effort)
    this.sendPush(
      createNotificationDto.userId,
      createNotificationDto.title,
      createNotificationDto.content,
      createNotificationDto.invitationId,
    ).catch(() => null);
    return notif;
  }

  /** Expo push token kaydet/güncelle */
  async savePushToken(userId: string, token: string) {
    if (!token || !/^Expo(nent)?PushToken\[/.test(token)) {
      return { success: false, message: 'Geçersiz push token.' };
    }
    await this.prisma.user.update({ where: { id: userId }, data: { expoPushToken: token } });
    return { success: true };
  }

  /** Expo push API üzerinden bildirim gönderir — hata akışı asla bozmaz */
  private async sendPush(userId: string, title: string, body: string, invitationId?: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { expoPushToken: true } });
      const token = user?.expoPushToken;
      if (!token) return;
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // data: mobil uygulama bildirime dokununca ilgili davete gidebilsin diye
        body: JSON.stringify({ to: token, title, body, sound: 'default', data: invitationId ? { invitationId } : undefined }),
      });
    } catch (e: any) {
      this.logger.warn(`Push gönderilemedi: ${e?.message || e}`);
    }
  }

  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    // Sadece bildirim sahibi okundu olarak işaretleyebilir
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) return null;

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}

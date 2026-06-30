import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
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

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateGuestDto } from './dto/create-guest.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GuestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(createGuestDto: CreateGuestDto) {
    // Silinmiş (çöp kutusundaki) bir davete artık RSVP gönderilemez.
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: createGuestDto.invitationId, deletedAt: null },
    });

    if (!invitation) {
      throw new NotFoundException('Davetiye bulunamadı.');
    }

    const activeSub = await this.prisma.subscription.findFirst({
      where: { userId: invitation.userId, status: 'active' },
      orderBy: { endDate: 'desc' },
    });

    const plan = activeSub?.plan || 'free';
    const limit = plan === 'premium' ? Infinity : plan === 'pro' ? 500 : 50;

    const currentGuestCount = await this.prisma.guest.count({
      where: { invitationId: createGuestDto.invitationId }
    });

    if (currentGuestCount >= limit) {
      throw new ForbiddenException(`Misafir limitine ulaşıldı. Maksimum ${limit} kişi katılabilir.`);
    }

    const guest = await this.prisma.guest.create({
      data: createGuestDto,
    });

    // Davetiye sahibine bildirim gönder
    const statusText = guest.status === 'attending' ? 'katılacağını' :
                       guest.status === 'not_attending' ? 'katılamayacağını' : 'belki katılacağını';

    await this.notificationsService.create({
      userId: invitation.userId,
      title: 'Yeni LCV Yanıtı',
      content: `${guest.name} davetinize ${statusText} bildirdi.`,
    });

    return guest;
  }

  async findAllByInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.userId !== userId) {
      throw new NotFoundException('Davetiye bulunamadı veya yetkiniz yok.');
    }

    return this.prisma.guest.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: { invitation: true }
    });

    if (!guest || guest.invitation.userId !== userId) {
      throw new NotFoundException('Misafir bulunamadı veya yetkiniz yok.');
    }

    return this.prisma.guest.delete({ where: { id } });
  }
}

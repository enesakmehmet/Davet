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

    const deadline = (invitation.config as any)?.rsvpDeadlineDate;
    if (deadline) {
      const deadlineEnd = new Date(`${deadline}T23:59:59.999`);
      if (!Number.isNaN(deadlineEnd.getTime()) && deadlineEnd.getTime() < Date.now()) {
        throw new ForbiddenException('Katılım bildirim süresi sona erdi.');
      }
    }

    const activeSub = await this.prisma.subscription.findFirst({
      where: { userId: invitation.userId, status: 'active' },
      orderBy: { endDate: 'desc' },
    });

    const plan = activeSub?.plan || 'free';
    const limit = plan === 'premium' ? Infinity : plan === 'pro' ? 500 : 50;

    const contactWhere = [
      createGuestDto.email ? { email: createGuestDto.email.trim().toLowerCase() } : null,
      createGuestDto.phone ? { phone: createGuestDto.phone.replace(/\D/g, '') } : null,
    ].filter(Boolean) as any[];
    const existingGuest = contactWhere.length
      ? await this.prisma.guest.findFirst({ where: { invitationId: createGuestDto.invitationId, OR: contactWhere } })
      : null;

    if (existingGuest) {
      const guest = await this.prisma.guest.update({
        where: { id: existingGuest.id },
        data: {
          ...createGuestDto,
          email: createGuestDto.email?.trim().toLowerCase() || null,
          phone: createGuestDto.phone?.replace(/\D/g, '') || null,
        },
      });
      return { ...guest, updated: true };
    }

    const currentGuestCount = await this.prisma.guest.count({
      where: { invitationId: createGuestDto.invitationId }
    });

    if (currentGuestCount >= limit) {
      throw new ForbiddenException(`Misafir limitine ulaşıldı. Maksimum ${limit} kişi katılabilir.`);
    }

    const guest = await this.prisma.guest.create({
      data: {
        ...createGuestDto,
        email: createGuestDto.email?.trim().toLowerCase() || null,
        phone: createGuestDto.phone?.replace(/\D/g, '') || null,
      },
    });

    // Davetiye sahibine bildirim gönder
    const statusText = guest.status === 'attending' ? 'katılacağını' :
                       guest.status === 'not_attending' ? 'katılamayacağını' : 'belki katılacağını';

    await this.notificationsService.create({
      userId: invitation.userId,
      title: 'Yeni LCV Yanıtı',
      content: `${guest.name} davetinize ${statusText} bildirdi.`,
      invitationId: invitation.id,
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

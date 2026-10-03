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
      // Son gün TÜRKİYE saatiyle biter (davetiyedeki ve editördeki kuralla aynı). Eskiden saat
      // dilimi verilmediği için sunucunun saati (Railway = UTC) kullanılıyordu: davetiye "süre
      // doldu" deyip formu kapattıktan sonra API 3 saat daha yanıt kabul ediyordu.
      const deadlineEnd = new Date(`${deadline}T23:59:59.999+03:00`);
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
      // Misafir kararını değiştirdiyse (ör. "katılıyorum" → "katılamıyorum") davet sahibi bunu
      // bilmeli; eskiden güncellemelerde hiç bildirim gitmiyordu, sahip eski yanıta güvenip
      // yanlış kişi sayısıyla planlama yapabiliyordu.
      if (existingGuest.status !== guest.status) {
        await this.notifyOwner(invitation.userId, invitation.id,
          `${guest.name} katılım yanıtını değiştirdi: artık ${this.statusText(guest.status)} bildirdi.`, 'LCV Yanıtı Değişti');
      }
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
    await this.notifyOwner(invitation.userId, invitation.id,
      `${guest.name} davetinize ${this.statusText(guest.status)} bildirdi.`, 'Yeni LCV Yanıtı');

    return guest;
  }

  private statusText(status: string) {
    return status === 'attending' ? 'katılacağını' :
           status === 'not_attending' ? 'katılamayacağını' : 'belki katılacağını';
  }

  /**
   * Bildirim/push gönderimi hata verirse RSVP'yi DÜŞÜRMEZ. Eskiden bildirim adımı patlarsa
   * misafir kaydı veritabanına yazılmış olduğu hâlde misafire hata dönüyordu; misafir tekrar
   * deneyip aynı yanıtı ikinci kez gönderiyor ya da "olmadı" sanıp vazgeçiyordu.
   */
  private async notifyOwner(userId: string, invitationId: string, content: string, title: string) {
    try {
      await this.notificationsService.create({ userId, title, content, invitationId });
    } catch {
      /* bildirim hatası, kaydedilmiş RSVP'yi başarısız göstermemeli */
    }
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

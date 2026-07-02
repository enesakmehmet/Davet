import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createInvitationDto: CreateInvitationDto, userId: string) {
    const existing = await this.prisma.invitation.findUnique({ where: { slug: createInvitationDto.slug } });
    if (existing) {
      throw new ConflictException('Bu bağlantı (slug) zaten kullanımda.');
    }

    const { pages, password, ...invitationData } = createInvitationDto as any;
    
    let passwordHash = null;
    let isPasswordProtected = false;
    if (password) {
      const bcrypt = require('bcrypt');
      passwordHash = await bcrypt.hash(password, 10);
      isPasswordProtected = true;
    }

    return this.prisma.invitation.create({
      data: {
        ...invitationData,
        isPasswordProtected,
        passwordHash,
        userId,
        pages: pages ? {
          create: pages.map(p => ({
            pageNumber: p.pageNumber,
            elements: p.elements as Prisma.InputJsonObject,
          }))
        } : undefined,
      },
      include: {
        pages: true,
      }
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.invitation.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { guests: true } },
      },
    });
  }

  async findOneBySlug(slug: string, password?: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { slug, deletedAt: null },
      include: { pages: true, user: { select: { name: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Davetiye bulunamadı.');
    }

    if (invitation.isPasswordProtected) {
      if (!password) {
        throw new ForbiddenException('Bu davetiye şifre korumalıdır. Lütfen şifre giriniz.');
      }
      const bcrypt = require('bcrypt');
      const isMatch = await bcrypt.compare(password, invitation.passwordHash);
      if (!isMatch) {
        throw new ForbiddenException('Hatalı şifre.');
      }
    }

    // Hassas alanı public yanıttan çıkar (passwordHash sızdırma)
    const { passwordHash, ...safeInvitation } = invitation as any;
    return safeInvitation;
  }

  async update(id: string, updateInvitationDto: UpdateInvitationDto, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({ where: { id, deletedAt: null } });
    
    if (!invitation) throw new NotFoundException('Davetiye bulunamadı.');
    if (invitation.userId !== userId) throw new ForbiddenException('Bu davetiyeyi düzenleme yetkiniz yok.');

    const { pages, password, ...updateData } = updateInvitationDto as any;

    // Slug değişiyorsa çakışma kontrolü (özel link seçme desteği)
    if (updateData.slug && updateData.slug !== invitation.slug) {
      const slugTaken = await this.prisma.invitation.findUnique({ where: { slug: updateData.slug } });
      if (slugTaken && slugTaken.id !== id) {
        throw new ConflictException('Bu bağlantı (slug) zaten kullanımda.');
      }
    }

    let updatePayload: Prisma.InvitationUpdateInput = { ...updateData };
    
    if (password !== undefined) {
      if (password === null || password === '') {
        updatePayload.isPasswordProtected = false;
        updatePayload.passwordHash = null;
      } else {
        const bcrypt = require('bcrypt');
        updatePayload.passwordHash = await bcrypt.hash(password, 10);
        updatePayload.isPasswordProtected = true;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedInv = await tx.invitation.update({
        where: { id },
        data: updatePayload,
      });

      if (pages) {
        await tx.invitationPage.deleteMany({ where: { invitationId: id } });
        await tx.invitationPage.createMany({
          data: pages.map(p => ({
            invitationId: id,
            pageNumber: p.pageNumber,
            elements: p.elements as Prisma.InputJsonObject,
          }))
        });
      }

      return tx.invitation.findUnique({ where: { id }, include: { pages: true } });
    });
  }

  async remove(id: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({ where: { id, deletedAt: null } });
    if (!invitation) throw new NotFoundException('Davetiye bulunamadı.');
    if (invitation.userId !== userId) throw new ForbiddenException('Yetkisiz işlem.');

    // Yalnızca soft delete: davet 30 gün çöp kutusunda kalır ve geri alınabilir.
    // Bağlı dosyalar kalıcı temizlikte (purgeTrash cron) silinir ki geri alma mümkün olsun.
    return this.prisma.invitation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /* ===== Çöp kutusu ===== */
  async findTrashByUser(userId: string) {
    return this.prisma.invitation.findMany({
      where: { userId, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      include: { _count: { select: { guests: true } } },
    });
  }

  async restore(id: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!invitation) throw new NotFoundException('Davetiye çöp kutusunda bulunamadı.');
    if (invitation.userId !== userId) throw new ForbiddenException('Yetkisiz işlem.');

    return this.prisma.invitation.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /* Davete bağlı yüklenmiş dosyaları (müzik + fotoğraf) DB'den siler */
  private async deleteLinkedAssets(invitation: { config: any; userId: string }) {
    try {
      const cfg: any = invitation.config;
      const assetIds = new Set<string>();
      const collect = (val: unknown) => {
        if (typeof val !== 'string') return;
        const matches = val.matchAll(/\/assets\/file\/([0-9a-fA-F-]+)/g);
        for (const m of matches) assetIds.add(m[1]);
      };
      collect(cfg?.musicUrl);
      if (Array.isArray(cfg?.photos)) {
        cfg.photos.forEach((p: any) => collect(typeof p === 'string' ? p : p?.url));
      }
      if (assetIds.size) {
        await this.prisma.asset.deleteMany({ where: { id: { in: [...assetIds] }, userId: invitation.userId } });
      }
    } catch {
      /* dosya temizliği kalıcı silmeyi engellemesin */
    }
  }

  /* ===== Zamanlanmış işler ===== */

  /** Her gece 03:00 — 1 yılı dolan davetleri yayından kaldırır (çöp kutusuna taşır). */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async expireOldInvitations() {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000);
    const expired = await this.prisma.invitation.findMany({
      where: { deletedAt: null, createdAt: { lt: oneYearAgo } },
      select: { id: true, title: true, userId: true },
    });
    for (const inv of expired) {
      await this.prisma.invitation.update({ where: { id: inv.id }, data: { deletedAt: new Date() } });
      await this.prisma.notification.create({
        data: {
          userId: inv.userId,
          title: 'Davetiyenin yayın süresi doldu',
          content: `"${inv.title}" 1 yıllık yayın süresini doldurdu ve yayından kaldırıldı.`,
        },
      }).catch(() => null);
    }
    if (expired.length) this.logger.log(`${expired.length} davetin yayın süresi doldu.`);
  }

  /** Her gece 04:00 — çöp kutusunda 30 günü dolan davetleri kalıcı siler. */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async purgeTrash() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const toPurge = await this.prisma.invitation.findMany({
      where: { deletedAt: { not: null, lt: thirtyDaysAgo } },
      select: { id: true, config: true, userId: true },
    });
    for (const inv of toPurge) {
      await this.deleteLinkedAssets(inv as any);
      await this.prisma.invitation.delete({ where: { id: inv.id } }).catch(() => null);
    }
    if (toPurge.length) this.logger.log(`${toPurge.length} davet kalıcı olarak silindi.`);
  }

  /** Her sabah 09:00 — etkinliğine 3 gün kalan davet sahiplerine hatırlatma gönderir. */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendUpcomingReminders() {
    const start = new Date(); start.setDate(start.getDate() + 3); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setHours(23, 59, 59, 999);

    const upcoming = await this.prisma.invitation.findMany({
      where: { deletedAt: null, eventDate: { gte: start, lte: end } },
      include: { user: { select: { email: true, name: true } }, _count: { select: { guests: true } } },
    });

    for (const inv of upcoming) {
      const rsvp = inv._count?.guests ?? 0;
      await this.prisma.notification.create({
        data: {
          userId: inv.userId,
          title: 'Etkinliğine 3 gün kaldı! 🎉',
          content: `"${inv.title}" için geri sayım başladı. Şu ana kadar ${rsvp} RSVP yanıtı aldın.`,
        },
      }).catch(() => null);

      if (inv.user?.email) {
        await this.mailService.sendMail({
          to: inv.user.email,
          subject: `${inv.title} — 3 gün kaldı! 🎉`,
          text: `Merhaba ${inv.user.name || ''},\n\n"${inv.title}" etkinliğine 3 gün kaldı. Şu ana kadar ${rsvp} RSVP yanıtı aldınız.\n\nMisafir listenizi panelden kontrol edebilirsiniz.\n\nDavetim`,
          html: `<p>Merhaba <strong>${inv.user.name || ''}</strong>,</p><p>"<strong>${inv.title}</strong>" etkinliğine <strong>3 gün</strong> kaldı. Şu ana kadar <strong>${rsvp}</strong> RSVP yanıtı aldınız.</p><p>Misafir listenizi panelden kontrol edebilirsiniz.</p><p>Davetim 💛</p>`,
        }).catch((e) => this.logger.warn(`Hatırlatma e-postası gönderilemedi: ${e.message}`));
      }
    }
    if (upcoming.length) this.logger.log(`${upcoming.length} davet sahibine hatırlatma gönderildi.`);
  }
}

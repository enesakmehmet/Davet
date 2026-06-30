import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

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

    const { pages, ...updateData } = updateInvitationDto;

    return this.prisma.$transaction(async (tx) => {
      const updatedInv = await tx.invitation.update({
        where: { id },
        data: updateData as Prisma.InvitationUpdateInput,
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

    // Davete bağlı müzik dosyasını DB'den tamamen sil (geride bir şey kalmasın)
    try {
      const cfg: any = invitation.config;
      const url: string | undefined = cfg?.musicUrl;
      const m = typeof url === 'string' ? url.match(/\/assets\/file\/([0-9a-fA-F-]+)/) : null;
      if (m) {
        await this.prisma.asset.deleteMany({ where: { id: m[1], userId } });
      }
    } catch {
      /* müzik silme hatası daveti kaldırmayı engellemesin */
    }

    return this.prisma.invitation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

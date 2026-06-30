import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AutosaveDto } from './dto/autosave.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EditorService {
  constructor(private prisma: PrismaService) {}

  async autosave(autosaveDto: AutosaveDto, userId: string) {
    const { invitationId, versionNumber, editorData } = autosaveDto;

    const invitation = await this.prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Davetiye bulunamadı.');
    if (invitation.userId !== userId) throw new ForbiddenException('Yetkisiz erişim.');

    return this.prisma.invitationVersion.create({
      data: {
        invitationId,
        versionNumber,
        editorData: editorData as Prisma.InputJsonObject,
      }
    });
  }

  async getVersions(invitationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation || invitation.userId !== userId) throw new ForbiddenException('Yetkisiz erişim.');

    return this.prisma.invitationVersion.findMany({
      where: { invitationId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

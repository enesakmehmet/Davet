import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createTemplateDto: CreateTemplateDto, userId: string) {
    return this.prisma.template.create({
      data: {
        ...createTemplateDto,
        elements: createTemplateDto.elements as Prisma.InputJsonObject,
        creatorId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.template.findMany({
      where: { deletedAt: null },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, deletedAt: null },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Şablon bulunamadı.');
    }

    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto, userId: string) {
    const template = await this.findOne(id);

    if (template.creatorId !== userId) {
      throw new ForbiddenException('Bu şablonu düzenleme yetkiniz yok.');
    }

    const updateData: any = { ...updateTemplateDto };
    if (updateData.elements) {
      updateData.elements = updateData.elements as Prisma.InputJsonObject;
    }

    return this.prisma.template.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const template = await this.findOne(id);

    if (template.creatorId !== userId) {
      throw new ForbiddenException('Bu şablonu silme yetkiniz yok.');
    }

    return this.prisma.template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

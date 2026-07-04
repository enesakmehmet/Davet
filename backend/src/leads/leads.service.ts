import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  // Aynı e-posta tekrar bırakılırsa hata vermez, sessizce günceller (dedupe)
  async create(dto: CreateLeadDto) {
    await this.prisma.lead.upsert({
      where: { email: dto.email.toLowerCase().trim() },
      update: { source: dto.source },
      create: { email: dto.email.toLowerCase().trim(), source: dto.source },
    });
    return { message: 'Teşekkürler! Seni haberdar edeceğiz.' };
  }

  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}

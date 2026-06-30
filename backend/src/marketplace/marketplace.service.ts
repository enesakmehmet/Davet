import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  // Category
  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.prisma.templateCategory.create({ data: createCategoryDto });
  }

  async getCategories() {
    return this.prisma.templateCategory.findMany();
  }

  // Reviews
  async createReview(createReviewDto: CreateReviewDto, userId: string) {
    const template = await this.prisma.template.findUnique({ where: { id: createReviewDto.templateId } });
    if (!template) throw new NotFoundException('Şablon bulunamadı.');

    return this.prisma.templateReview.create({
      data: {
        ...createReviewDto,
        userId,
      }
    });
  }

  async getTemplateReviews(templateId: string) {
    return this.prisma.templateReview.findMany({
      where: { templateId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Sales
  async recordSale(templateId: string, paymentId: string, price: number) {
    return this.prisma.templateSale.create({
      data: { templateId, paymentId, price }
    });
  }

  async getTemplateSales(templateId: string) {
    return this.prisma.templateSale.findMany({
      where: { templateId },
      include: { payment: true }
    });
  }
}

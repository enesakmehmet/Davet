import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAccessGuard } from '../auth/guards/admin-access.guard';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // Kategori taksonomisi yalnızca yönetici tarafından oluşturulmalı (herkese açık yazma değil).
  @UseGuards(AdminAccessGuard)
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.marketplaceService.createCategory(createCategoryDto);
  }

  @Get('categories')
  getCategories() {
    return this.marketplaceService.getCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.marketplaceService.createReview(createReviewDto, req.user.id);
  }

  @Get('reviews/:templateId')
  getReviews(@Param('templateId') templateId: string) {
    return this.marketplaceService.getTemplateReviews(templateId);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { update: jest.fn(), findMany: jest.fn() },
      invitation: { findFirst: jest.fn(), update: jest.fn(), findMany: jest.fn() },
      payment: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: AnalyticsService, useValue: {} },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('tanımlı olmalı', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserRole', () => {
    it('geçersiz bir rol verilirse güvenli şekilde "user" yapar', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'user' });
      const result = await service.updateUserRole('u1', 'süper-admin-hack');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { role: 'user' },
        select: { id: true, email: true, role: true },
      });
      expect(result.user.role).toBe('user');
    });

    it('"admin" rolü verilirse admin yapar', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'admin' });
      await service.updateUserRole('u1', 'admin');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { role: 'admin' } }));
    });
  });

  describe('removeInvitation', () => {
    it('davetiye yoksa veya zaten silinmişse NotFoundException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);
      await expect(service.removeInvitation('yok')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.invitation.update).not.toHaveBeenCalled();
    });

    it('davetiyeyi soft-delete yapar (sahiplik kontrolü yapılmaz)', async () => {
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'baska-kullanici' });
      prisma.invitation.update.mockResolvedValue({});

      const result = await service.removeInvitation('inv1');

      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result.message).toContain('kaldırıldı');
    });
  });

  describe('getTrends', () => {
    it('30 günlük gün listesi + günlük kullanıcı/gelir toplamlarını döner', async () => {
      const today = new Date().toISOString().slice(0, 10);
      prisma.user.findMany.mockResolvedValue([{ createdAt: new Date() }, { createdAt: new Date() }]);
      prisma.payment.findMany.mockResolvedValue([{ createdAt: new Date(), amount: 150 }]);

      const result = await service.getTrends();

      expect(result.days).toHaveLength(30);
      expect(result.days[result.days.length - 1]).toBe(today);
      expect(result.dailyUsers[today]).toBe(2);
      expect(result.dailyRevenue[today]).toBe(150);
    });
  });
});

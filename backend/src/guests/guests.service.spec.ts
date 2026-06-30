import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('GuestsService', () => {
  let service: GuestsService;
  let prisma: any;
  let notifications: any;

  beforeEach(async () => {
    prisma = {
      invitation: { findUnique: jest.fn() },
      subscription: { findFirst: jest.fn() },
      guest: { count: jest.fn(), create: jest.fn() },
    };
    notifications = { create: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<GuestsService>(GuestsService);
  });

  it('tanımlı olmalı', () => {
    expect(service).toBeDefined();
  });

  it('davetiye yoksa NotFoundException fırlatır', async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ invitationId: 'yok', name: 'Ali', status: 'attending' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('misafir limiti dolduğunda ForbiddenException fırlatır', async () => {
    prisma.invitation.findUnique.mockResolvedValue({ id: 'inv1', userId: 'u1' });
    prisma.subscription.findFirst.mockResolvedValue(null); // free plan -> limit 50
    prisma.guest.count.mockResolvedValue(50);
    await expect(
      service.create({ invitationId: 'inv1', name: 'Ali', status: 'attending' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('geçerli RSVP misafiri oluşturur ve sahibe bildirim gönderir', async () => {
    prisma.invitation.findUnique.mockResolvedValue({ id: 'inv1', userId: 'u1' });
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.guest.count.mockResolvedValue(3);
    prisma.guest.create.mockResolvedValue({ id: 'g1', name: 'Ayşe', status: 'attending' });

    const result = await service.create({
      invitationId: 'inv1', name: 'Ayşe', status: 'attending', companionCount: 2,
    } as any);

    expect(result).toEqual({ id: 'g1', name: 'Ayşe', status: 'attending' });
    expect(prisma.guest.create).toHaveBeenCalled();
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', title: 'Yeni LCV Yanıtı' }),
    );
  });
});

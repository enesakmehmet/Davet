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
      invitation: { findFirst: jest.fn() },
      subscription: { findFirst: jest.fn() },
      guest: { findFirst: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
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
    prisma.invitation.findFirst.mockResolvedValue(null);
    await expect(
      service.create({ invitationId: 'yok', name: 'Ali', status: 'attending' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('misafir limiti dolduğunda ForbiddenException fırlatır', async () => {
    prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1' });
    prisma.subscription.findFirst.mockResolvedValue(null); // free plan -> limit 50
    prisma.guest.count.mockResolvedValue(50);
    await expect(
      service.create({ invitationId: 'inv1', name: 'Ali', status: 'attending' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('geçerli RSVP misafiri oluşturur ve sahibe bildirim gönderir', async () => {
    prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1' });
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

  it('bildirim gönderilemese bile kaydedilmiş RSVP başarılı döner', async () => {
    prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1' });
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.guest.count.mockResolvedValue(0);
    prisma.guest.create.mockResolvedValue({ id: 'g1', name: 'Ayşe', status: 'attending' });
    notifications.create.mockRejectedValue(new Error('push servisi çöktü'));

    await expect(
      service.create({ invitationId: 'inv1', name: 'Ayşe', status: 'attending' } as any),
    ).resolves.toEqual({ id: 'g1', name: 'Ayşe', status: 'attending' });
  });

  it('misafir kararını değiştirirse sahibe "yanıt değişti" bildirimi gider', async () => {
    prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1' });
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.guest.findFirst.mockResolvedValue({ id: 'g1', status: 'attending' });
    prisma.guest.update.mockResolvedValue({ id: 'g1', name: 'Ayşe', status: 'not_attending' });

    const r = await service.create({ invitationId: 'inv1', name: 'Ayşe', email: 'a@b.com', status: 'not_attending' } as any);

    expect(r).toMatchObject({ updated: true });
    expect(notifications.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'LCV Yanıtı Değişti' }));
  });

  it('karar aynı kalırsa (ör. sadece isim düzeltme) tekrar bildirim gönderilmez', async () => {
    prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1' });
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.guest.findFirst.mockResolvedValue({ id: 'g1', status: 'attending' });
    prisma.guest.update.mockResolvedValue({ id: 'g1', name: 'Ayşe Y.', status: 'attending' });

    await service.create({ invitationId: 'inv1', name: 'Ayşe Y.', email: 'a@b.com', status: 'attending' } as any);

    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('RSVP son günü Türkiye saatiyle kapanır (UTC sunucuda 3 saat fazla açık kalmaz)', async () => {
    // Son gün 10 Eylül. Şu an Türkiye'de 11 Eylül 01:00 = UTC 10 Eylül 22:00.
    // Eski kod (UTC'ye göre 10 Eylül 23:59) bu isteği KABUL ediyordu; doğrusu reddetmek.
    jest.useFakeTimers().setSystemTime(new Date('2026-09-10T22:00:00Z'));
    try {
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1', config: { rsvpDeadlineDate: '2026-09-10' } });
      await expect(
        service.create({ invitationId: 'inv1', name: 'Ali', status: 'attending' } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    } finally {
      jest.useRealTimers();
    }
  });

  it('son günün Türkiye saatiyle 23:00\'ünde yanıt hâlâ kabul edilir', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-10T20:00:00Z')); // TR 23:00
    try {
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'u1', config: { rsvpDeadlineDate: '2026-09-10' } });
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.guest.count.mockResolvedValue(0);
      prisma.guest.create.mockResolvedValue({ id: 'g9', name: 'Ali', status: 'attending' });
      await expect(
        service.create({ invitationId: 'inv1', name: 'Ali', status: 'attending' } as any),
      ).resolves.toMatchObject({ id: 'g9' });
    } finally {
      jest.useRealTimers();
    }
  });
});

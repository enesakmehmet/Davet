import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

/** İki eşzamanlı isteğin aynı slug'ı almaya çalıştığı yarış durumunu simüle eder */
const p2002 = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' });

/** Kritik yayınlama/çöp kutusu akışlarının birim testleri (DB'siz, mock prisma ile) */
describe('InvitationsService', () => {
  let service: InvitationsService;

  const prismaMock = {
    user: { findUnique: jest.fn() },
    subscription: { findFirst: jest.fn() },
    invitation: {
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notification: { create: jest.fn().mockResolvedValue({}) },
    asset: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const mailMock = { sendMail: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);

    // Varsayılan mutlu yol
    prismaMock.user.findUnique.mockResolvedValue({ emailVerified: true });
    prismaMock.subscription.findFirst.mockResolvedValue(null); // free plan
    prismaMock.invitation.count.mockResolvedValue(0);
    prismaMock.invitation.findUnique.mockResolvedValue(null); // slug boşta
    prismaMock.invitation.create.mockResolvedValue({ id: 'inv-1', slug: 'test-slug' });
  });

  const dto: any = { title: 'Test Davet', slug: 'test-slug', config: { theme: 'altin' } };

  describe('create (yayınlama)', () => {
    it('doğrulanmış kullanıcı davet yayınlayabilir', async () => {
      const result = await service.create(dto, 'user-1');
      expect(result).toEqual(expect.objectContaining({ id: 'inv-1' }));
      expect(prismaMock.invitation.create).toHaveBeenCalled();
    });

    it('e-postası doğrulanmamış kullanıcı yayınlayamaz', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ emailVerified: false });
      await expect(service.create(dto, 'user-1')).rejects.toThrow(ForbiddenException);
      expect(prismaMock.invitation.create).not.toHaveBeenCalled();
    });

    it('free plan davet limitini aşamaz', async () => {
      prismaMock.invitation.count.mockResolvedValue(5); // varsayılan limit: 5
      await expect(service.create(dto, 'user-1')).rejects.toThrow(ForbiddenException);
      expect(prismaMock.invitation.create).not.toHaveBeenCalled();
    });

    it('kullanımda olan slug reddedilir', async () => {
      prismaMock.invitation.findUnique.mockResolvedValue({ id: 'baska-davet', slug: 'test-slug' });
      await expect(service.create(dto, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('yarış durumu: ön kontrolden geçse de create sırasında P2002 gelirse ConflictException döner (500 değil)', async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(null); // ön kontrol: slug boşta görünüyor
      prismaMock.invitation.create.mockRejectedValue(p2002()); // ama tam o anda başka istek almış
      await expect(service.create(dto, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('create sırasında P2002 dışındaki bir hata olduğu gibi fırlatılır', async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(null);
      prismaMock.invitation.create.mockRejectedValue(new Error('beklenmedik db hatası'));
      await expect(service.create(dto, 'user-1')).rejects.toThrow('beklenmedik db hatası');
    });
  });

  describe('update (slug değişikliği yarış durumu)', () => {
    const txMock = {
      invitation: { update: jest.fn(), findUnique: jest.fn() },
      invitationPage: { deleteMany: jest.fn(), createMany: jest.fn() },
    };

    beforeEach(() => {
      prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock));
      prismaMock.invitation.findFirst.mockResolvedValue({ id: 'inv-1', userId: 'user-1', slug: 'eski-slug' });
      txMock.invitation.update.mockResolvedValue({ id: 'inv-1' });
      txMock.invitation.findUnique.mockResolvedValue({ id: 'inv-1', slug: 'yeni-slug' });
    });

    it('yarış durumu: slug ön kontrolden geçse de transaction sırasında P2002 gelirse ConflictException döner (500 değil)', async () => {
      prismaMock.invitation.findUnique.mockResolvedValue(null); // ön kontrol: slug boşta görünüyor
      txMock.invitation.update.mockRejectedValue(p2002()); // ama tam o anda başka istek almış
      await expect(service.update('inv-1', { slug: 'yeni-slug' } as any, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('zaten kullanımdaki slug ön kontrolde reddedilir', async () => {
      prismaMock.invitation.findUnique.mockResolvedValue({ id: 'baska-davet', slug: 'yeni-slug' });
      await expect(service.update('inv-1', { slug: 'yeni-slug' } as any, 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('restore (çöp kutusundan geri alma)', () => {
    it('çöpteki davet geri alınabilir', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue({ id: 'inv-1', userId: 'user-1', deletedAt: new Date() });
      prismaMock.invitation.update.mockResolvedValue({ id: 'inv-1', deletedAt: null });
      const result = await service.restore('inv-1', 'user-1');
      expect(result.deletedAt).toBeNull();
    });

    it('çöpte olmayan davet için NotFound döner', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue(null);
      await expect(service.restore('yok', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('başkasının daveti geri alınamaz', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue({ id: 'inv-1', userId: 'baskasi', deletedAt: new Date() });
      await expect(service.restore('inv-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove (yayından kaldırma)', () => {
    it('soft delete yapar, kalıcı silmez', async () => {
      prismaMock.invitation.findFirst.mockResolvedValue({ id: 'inv-1', userId: 'user-1' });
      prismaMock.invitation.update.mockResolvedValue({ id: 'inv-1', deletedAt: new Date() });
      await service.remove('inv-1', 'user-1');
      expect(prismaMock.invitation.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      );
      expect(prismaMock.invitation.delete).not.toHaveBeenCalled();
    });
  });
});

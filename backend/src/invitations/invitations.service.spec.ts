import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pw'),
  compare: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

describe('InvitationsService', () => {
  let service: InvitationsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      invitation: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      asset: { deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    jest.clearAllMocks();
  });

  it('tanımlı olmalı', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('slug zaten kullanımdaysa ConflictException fırlatır', async () => {
      prisma.invitation.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ slug: 'kullanimda' } as any, 'user1'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.invitation.create).not.toHaveBeenCalled();
    });

    it('geçerli veriyle davetiye oluşturur', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);
      prisma.invitation.create.mockResolvedValue({ id: 'inv1', slug: 'yeni-davet' });

      const result = await service.create({ slug: 'yeni-davet', title: 'Test' } as any, 'user1');

      expect(result).toEqual({ id: 'inv1', slug: 'yeni-davet' });
      expect(prisma.invitation.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: 'user1' }) }),
      );
    });
  });

  describe('findOneBySlug', () => {
    it('davetiye bulunamazsa NotFoundException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);
      await expect(service.findOneBySlug('yok')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('şifre korumalı davetiyede şifre verilmezse ForbiddenException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue({
        id: 'inv1', isPasswordProtected: true, passwordHash: 'hashed-pw',
      });
      await expect(service.findOneBySlug('korumali')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('şifre korumalı davetiyede hatalı şifre ForbiddenException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue({
        id: 'inv1', isPasswordProtected: true, passwordHash: 'hashed-pw',
      });
      bcrypt.compare.mockResolvedValue(false);
      await expect(service.findOneBySlug('korumali', 'yanlis-sifre')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('passwordHash alanını yanıttan çıkarır (sızdırmaz)', async () => {
      prisma.invitation.findFirst.mockResolvedValue({
        id: 'inv1', slug: 'acik-davet', isPasswordProtected: false, passwordHash: null,
      });
      const result = await service.findOneBySlug('acik-davet');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toEqual({ id: 'inv1', slug: 'acik-davet', isPasswordProtected: false });
    });
  });

  describe('update', () => {
    it('davetiye bulunamazsa NotFoundException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);
      await expect(service.update('yok', {} as any, 'user1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('başka kullanıcının davetiyesi düzenlenmeye çalışılırsa ForbiddenException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'baska-kullanici' });
      await expect(service.update('inv1', {} as any, 'user1')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('davetiye bulunamazsa NotFoundException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);
      await expect(service.remove('yok', 'user1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('başka kullanıcının davetiyesi silinmeye çalışılırsa ForbiddenException fırlatır', async () => {
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'baska-kullanici' });
      await expect(service.remove('inv1', 'user1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('sahibi doğruysa davetiyeyi soft-delete yapar (deletedAt set edilir)', async () => {
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv1', userId: 'user1', config: {} });
      prisma.invitation.update.mockResolvedValue({ id: 'inv1', deletedAt: new Date() });

      await service.remove('inv1', 'user1');

      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });
  });
});

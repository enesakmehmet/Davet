import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { QrCodesService } from './qr-codes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QrCodesService', () => {
  let service: QrCodesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      invitation: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [QrCodesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<QrCodesService>(QrCodesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tanımlı olmalı', () => {
    expect(service).toBeDefined();
  });

  it('davetiye yoksa NotFoundException fırlatır (generateQRCode)', async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);
    await expect(service.generateQRCode('yok')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('davetiye yoksa NotFoundException fırlatır (generateQRCodeBuffer)', async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);
    await expect(service.generateQRCodeBuffer('yok')).rejects.toBeInstanceOf(NotFoundException);
  });

  // Regresyon testi: QR kod, gerçek davet route'u olan /davet/{slug} adresine işaret etmeli.
  // (Daha önce yanlışlıkla var olmayan /invitation/{slug} route'una işaret ediyordu.)
  it('QR kod, /davet/{slug} bağlantısını kodlamalı, /invitation/{slug} DEĞİL', async () => {
    prisma.invitation.findUnique.mockResolvedValue({ slug: 'ayse-mehmet-a1b2' });
    process.env.FRONTEND_URL = 'https://example.com';

    const spy = (jest.spyOn(QRCode, 'toDataURL') as unknown as jest.SpyInstance)
      .mockResolvedValue('data:image/png;base64,xyz');

    const dataUrl = await service.generateQRCode('inv1');

    expect(spy).toHaveBeenCalledWith('https://example.com/davet/ayse-mehmet-a1b2', expect.any(Object));
    expect(dataUrl).toBe('data:image/png;base64,xyz');

    delete process.env.FRONTEND_URL;
  });

  it('generateQRCodeBuffer de /davet/{slug} bağlantısını kullanmalı', async () => {
    prisma.invitation.findUnique.mockResolvedValue({ slug: 'zeynep-ahmet-c3d4' });
    process.env.FRONTEND_URL = 'https://example.com';

    const spy = (jest.spyOn(QRCode, 'toBuffer') as unknown as jest.SpyInstance)
      .mockResolvedValue(Buffer.from('fake'));

    await service.generateQRCodeBuffer('inv2');

    expect(spy).toHaveBeenCalledWith('https://example.com/davet/zeynep-ahmet-c3d4', expect.any(Object));

    delete process.env.FRONTEND_URL;
  });
});

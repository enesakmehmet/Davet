import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';
import { EmailValidatorService } from './email-validator.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByEmailAndResetCode: jest.fn(),
    findByEmailAndVerifyCode: jest.fn(),
    findByVerifyToken: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'signed-token'),
    decode: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendVerificationCode: jest.fn(),
    sendForgotPassword: jest.fn(),
  };

  const mockEmailValidatorService = {
    assertRegistrable: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEmailValidatorService.assertRegistrable.mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: EmailValidatorService, useValue: mockEmailValidatorService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('yeni kullanıcı oluşturur, 6 haneli kod gönderir ama token DÖNMEZ (doğrulama bekler)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'A', role: 'user', emailVerified: false,
      });

      const result = await service.register({ email: 'a@b.com', password: '123456', name: 'A' });

      expect(mockEmailValidatorService.assertRegistrable).toHaveBeenCalledWith('a@b.com');
      expect(mockUsersService.create).toHaveBeenCalledWith(expect.objectContaining({
        verifyToken: expect.stringMatching(/^\d{6}$/),
        verifyTokenExpires: expect.any(Date),
      }));
      expect(mockMailService.sendVerificationCode).toHaveBeenCalledWith('a@b.com', expect.stringMatching(/^\d{6}$/));
      expect(result.pendingVerification).toBe(true);
      expect((result as any).access_token).toBeUndefined();
    });

    it('e-posta zaten doğrulanmış bir hesaba aitse ConflictException fırlatır', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', emailVerified: true });
      await expect(
        service.register({ email: 'a@b.com', password: '123456', name: 'A' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('e-posta kayıtlı ama henüz doğrulanmamışsa bilgileri günceller ve yeni kod gönderir (yarım kalmış kayıt)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: false });
      mockUsersService.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: false });

      const result = await service.register({ email: 'a@b.com', password: '123456', name: 'A' });

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({
        verifyToken: expect.stringMatching(/^\d{6}$/),
      }));
      expect(mockUsersService.create).not.toHaveBeenCalled();
      expect(result.pendingVerification).toBe(true);
    });

    it('doğrulama kodu gönderilemezse yeni oluşturulan hesabı siler ve hata fırlatır', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: false });
      mockMailService.sendVerificationCode.mockRejectedValue(new Error('mail hatası'));

      await expect(
        service.register({ email: 'a@b.com', password: '123456', name: 'A' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockUsersService.delete).toHaveBeenCalledWith('u1');
    });
  });

  describe('verifyRegistration', () => {
    it('geçersiz veya süresi dolmuş kod için BadRequestException fırlatır', async () => {
      mockUsersService.findByEmailAndVerifyCode.mockResolvedValue(null);
      await expect(
        service.verifyRegistration({ email: 'a@b.com', code: '000000' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('geçerli kodla hesabı doğrular ve token döner (giriş yaptırır)', async () => {
      mockUsersService.findByEmailAndVerifyCode.mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: false });
      mockUsersService.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: true });

      const result = await service.verifyRegistration({ email: 'a@b.com', code: '123456' });

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpires: null,
      }));
      expect(result.access_token).toBe('signed-token');
    });
  });

  describe('resendRegistrationCode', () => {
    it('kullanıcı yoksa da genel bir mesaj döner (e-posta sızdırmaz)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.resendRegistrationCode({ email: 'yok@b.com' });
      expect(result.message).toBeTruthy();
      expect(mockMailService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('doğrulanmamış kullanıcı için yeni kod üretir ve gönderir', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: false });
      mockUsersService.update.mockResolvedValue({});
      await service.resendRegistrationCode({ email: 'a@b.com' });

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({
        verifyToken: expect.stringMatching(/^\d{6}$/),
        verifyTokenExpires: expect.any(Date),
      }));
      expect(mockMailService.sendVerificationCode).toHaveBeenCalledWith('a@b.com', expect.stringMatching(/^\d{6}$/));
    });
  });

  describe('login', () => {
    it('kullanıcı yoksa UnauthorizedException fırlatır', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'yok@b.com', password: '123456' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('kullanıcı bulunamasa bile genel bir mesaj döner (e-posta sızdırmaz)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'yok@b.com' });
      expect(result.message).toContain('kayıtlıysa');
      expect(mockMailService.sendForgotPassword).not.toHaveBeenCalled();
    });

    it('kullanıcı varsa 6 haneli reset kodu üretip mail gönderir (10 dk geçerli)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      mockUsersService.update.mockResolvedValue({});
      await service.forgotPassword({ email: 'a@b.com' });

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({
        resetToken: expect.stringMatching(/^\d{6}$/),
        resetTokenExpires: expect.any(Date),
      }));

      const [, updateArgs] = mockUsersService.update.mock.calls[0];
      const minutesLeft = (updateArgs.resetTokenExpires.getTime() - Date.now()) / 60000;
      expect(minutesLeft).toBeGreaterThan(9);
      expect(minutesLeft).toBeLessThanOrEqual(10);

      expect(mockMailService.sendForgotPassword).toHaveBeenCalledWith(
        'a@b.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });
  });

  describe('resetPassword', () => {
    it('geçersiz kod için BadRequestException fırlatır', async () => {
      mockUsersService.findByEmailAndResetCode.mockResolvedValue(null);
      await expect(
        service.resetPassword({ email: 'a@b.com', code: '000000', newPassword: 'YeniSifre1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('geçerli kodla şifreyi değiştirir ve refreshToken/resetToken temizlenir', async () => {
      mockUsersService.findByEmailAndResetCode.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      mockUsersService.update.mockResolvedValue({});

      const result = await service.resetPassword({ email: 'a@b.com', code: '123456', newPassword: 'YeniSifre1' });

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({
        resetToken: null,
        resetTokenExpires: null,
        refreshToken: null,
      }));
      expect(result.message).toContain('değiştirildi');
    });
  });

  describe('verifyEmail', () => {
    it('geçersiz token için BadRequestException fırlatır', async () => {
      mockUsersService.findByVerifyToken.mockResolvedValue(null);
      await expect(service.verifyEmail({ token: 'gecersiz' })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('geçerli token ile emailVerified=true yapar', async () => {
      mockUsersService.findByVerifyToken.mockResolvedValue({ id: 'u1' });
      mockUsersService.update.mockResolvedValue({});
      await service.verifyEmail({ token: 'gecerli' });
      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({ emailVerified: true }));
    });
  });
});

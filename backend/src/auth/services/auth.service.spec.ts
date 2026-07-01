import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByResetToken: jest.fn(),
    findByVerifyToken: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'signed-token'),
    decode: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendForgotPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('yeni kullanıcı için token üretir ve doğrulama e-postası gönderir', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'A', role: 'user', emailVerified: false,
      });
      mockUsersService.update.mockResolvedValue({});

      const result = await service.register({ email: 'a@b.com', password: '123456', name: 'A' });

      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result.access_token).toBe('signed-token');
      expect(result.user.emailVerified).toBe(false);
    });

    it('e-posta zaten kayıtlıysa ConflictException fırlatır', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1' });
      await expect(
        service.register({ email: 'a@b.com', password: '123456', name: 'A' }),
      ).rejects.toBeInstanceOf(ConflictException);
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

    it('kullanıcı varsa reset token üretip mail gönderir', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      mockUsersService.update.mockResolvedValue({});
      await service.forgotPassword({ email: 'a@b.com' });
      expect(mockUsersService.update).toHaveBeenCalledWith('u1', expect.objectContaining({
        resetToken: expect.any(String),
        resetTokenExpires: expect.any(Date),
      }));
      expect(mockMailService.sendForgotPassword).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('geçersiz token için BadRequestException fırlatır', async () => {
      mockUsersService.findByResetToken.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: 'gecersiz', newPassword: 'YeniSifre1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
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

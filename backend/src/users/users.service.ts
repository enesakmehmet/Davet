import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findByVerifyToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { verifyToken: token, verifyTokenExpires: { gt: new Date() } },
    });
  }

  /** Şifre sıfırlama kodu 6 hane olduğundan (çakışma/deneme riskine karşı) e-posta ile birlikte aranır. */
  async findByEmailAndResetCode(email: string, code: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, resetToken: code, resetTokenExpires: { gt: new Date() } },
    });
  }

  /** Kayıt doğrulama kodu (6 hane) de aynı sebeple e-posta ile birlikte aranır. */
  async findByEmailAndVerifyCode(email: string, code: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, verifyToken: code, verifyTokenExpires: { gt: new Date() } },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

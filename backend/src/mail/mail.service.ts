import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Gerçekte ENV'den alınmalıdır. Şimdilik dummy veriler.
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
      },
    });
  }

  async sendVerificationEmail(to: string, verifyLink: string) {
    await this.sendMail({
      to,
      subject: 'E-posta Adresinizi Doğrulayın',
      text: `Hoş geldiniz! E-posta adresinizi doğrulamak için şu linke tıklayın: ${verifyLink}`,
      html: `<p>Hoş geldiniz! E-posta adresinizi doğrulamak için <a href="${verifyLink}">buraya tıklayın</a>.</p><p>Link 24 saat geçerlidir.</p>`,
    });
  }

  async sendForgotPassword(to: string, resetLink: string) {
    await this.sendMail({
      to,
      subject: 'Şifre Sıfırlama Talebi',
      text: `Şifrenizi sıfırlamak için şu linke tıklayın: ${resetLink}`,
      html: `<p>Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a></p>`,
    });
  }

  async sendPurchaseNotification(to: string, templateName: string) {
    await this.sendMail({
      to,
      subject: 'Şablon Satın Alımı Başarılı',
      text: `Tebrikler! ${templateName} isimli şablonu başarıyla satın aldınız.`,
      html: `<p>Tebrikler! <strong>${templateName}</strong> isimli şablonu başarıyla satın aldınız.</p>`,
    });
  }

  async sendTemplatePurchaseNotification(to: string, templateName: string) {
    return this.sendPurchaseNotification(to, templateName);
  }

  async sendSubscriptionRenewal(to: string, planName: string, endDate: Date) {
    await this.sendMail({
      to,
      subject: 'Abonelik Yenileme',
      text: `${planName} aboneliğiniz başarıyla yenilendi. Bitiş tarihi: ${endDate.toLocaleDateString()}`,
      html: `<p><strong>${planName}</strong> aboneliğiniz başarıyla yenilendi.</p><p>Bitiş tarihi: ${endDate.toLocaleDateString()}</p>`,
    });
  }

  async sendSubscriptionConfirmation(
    to: string,
    planName: string,
    endDate: Date,
  ) {
    await this.sendMail({
      to,
      subject: 'Abonelik Onayı',
      text: `${planName} planına başarıyla abone oldunuz. Bitiş tarihi: ${endDate.toLocaleDateString()}`,
      html: `<p><strong>${planName}</strong> planına başarıyla abone oldunuz.</p><p>Bitiş tarihi: ${endDate.toLocaleDateString()}</p>`,
    });
  }

  async sendSubscriptionUpgrade(to: string, newPlan: string) {
    await this.sendMail({
      to,
      subject: 'Abonelik Yükseltildi',
      text: `Aboneliğiniz ${newPlan} planına yükseltildi.`,
      html: `<p>Aboneliğiniz <strong>${newPlan}</strong> planına yükseltildi.</p>`,
    });
  }

  async sendSubscriptionExpired(to: string, planName: string) {
    await this.sendMail({
      to,
      subject: 'Aboneliğinizin Süresi Doldu',
      text: `${planName} aboneliğinizin süresi doldu. Yenilemek için giriş yapın.`,
      html: `<p><strong>${planName}</strong> aboneliğinizin süresi doldu.</p><p>Yenilemek için <a href="${process.env.FRONTEND_URL}/subscriptions">buraya tıklayın</a></p>`,
    });
  }

  async sendPaymentConfirmation(
    to: string,
    amount: number,
    transactionId: string,
  ) {
    await this.sendMail({
      to,
      subject: 'Ödeme Onayı',
      text: `${amount} TL tutarındaki ödemeniz başarıyla alındı. İşlem ID: ${transactionId}`,
      html: `<p><strong>${amount} TL</strong> tutarındaki ödemeniz başarıyla alındı.</p><p>İşlem ID: ${transactionId}</p>`,
    });
  }

  async sendGuestNotification(
    to: string,
    guestName: string,
    invitationTitle: string,
  ) {
    await this.sendMail({
      to,
      subject: 'Yeni Misafir Yanıtı',
      text: `${guestName} davetinize yanıt verdi: ${invitationTitle}`,
      html: `<p><strong>${guestName}</strong> davetinize yanıt verdi:</p><p>${invitationTitle}</p>`,
    });
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Davetim" <noreply@davetim.com>',
        ...options,
      });
      this.logger.log(`E-posta gönderildi: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`E-posta gönderme hatası: ${error.message}`);
      throw error;
    }
  }
}

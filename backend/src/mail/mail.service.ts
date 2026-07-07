import { Injectable, Logger } from '@nestjs/common';

/**
 * E-posta gönderimi Resend (https://resend.com) üzerinden yapılır.
 * Ekstra bir SDK'ya gerek yok — Resend'in REST API'sine doğrudan istek atıyoruz.
 *
 * Gerekli ortam değişkenleri (.env):
 *   RESEND_API_KEY   → Resend hesabındaki API key (re_xxx...)
 *   MAIL_FROM        → Gönderen adres. Kendi domainini Resend'de doğrulamadıysan
 *                       "onboarding@resend.dev" test adresini kullanabilirsin
 *                       (bu durumda sadece Resend hesabına kayıtlı e-postana gönderim yapılabilir).
 *
 * RESEND_API_KEY tanımlı değilse (örn. lokal geliştirmede), e-postayı gerçekten
 * göndermek yerine sadece konsola yazarız — akış (kayıt/giriş/şifre sıfırlama)
 * e-posta olmadan da kesintisiz çalışmaya devam eder.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey = process.env.RESEND_API_KEY || '';
  private readonly from = process.env.MAIL_FROM || 'Davetim <onboarding@resend.dev>';

  async sendVerificationEmail(to: string, verifyLink: string) {
    await this.sendMail({
      to,
      subject: 'E-posta Adresinizi Doğrulayın',
      text: `Hoş geldiniz! E-posta adresinizi doğrulamak için şu linke tıklayın: ${verifyLink}`,
      html: `<p>Hoş geldiniz! E-posta adresinizi doğrulamak için <a href="${verifyLink}">buraya tıklayın</a>.</p><p>Link 24 saat geçerlidir.</p>`,
    });
  }

  /** Kayıt sırasında e-posta adresini doğrulamak için 6 haneli kod gönderir. */
  async sendVerificationCode(to: string, code: string) {
    await this.sendMail({
      to,
      subject: `${code} - Davetim Doğrulama Kodun`,
      text: `Davetim'e hoş geldin! Kaydını tamamlamak için doğrulama kodun: ${code}\nBu kod 15 dakika geçerlidir. Bu kaydı sen başlatmadıysan bu e-postayı yok sayabilirsin.`,
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto">
          <p>Davetim'e hoş geldin! Kaydını tamamlamak için aşağıdaki kodu gir:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;
             background:#f8f7f4;border-radius:12px;padding:18px 0;margin:20px 0">${code}</p>
          <p style="color:#8a8a8a;font-size:13px">Bu kod <strong>15 dakika</strong> geçerlidir. Bu kaydı sen başlatmadıysan bu e-postayı yok sayabilirsin.</p>
        </div>`,
    });
  }

  /** Şifre sıfırlama için 6 haneli tek kullanımlık kod gönderir (link değil). */
  async sendForgotPassword(to: string, code: string) {
    await this.sendMail({
      to,
      subject: `${code} - Şifre Sıfırlama Kodunuz`,
      text: `Şifre sıfırlama kodunuz: ${code}\nBu kod 10 dakika geçerlidir. Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`,
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto">
          <p>Şifreni sıfırlamak için aşağıdaki kodu kullan:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;text-align:center;
             background:#f8f7f4;border-radius:12px;padding:18px 0;margin:20px 0">${code}</p>
          <p style="color:#8a8a8a;font-size:13px">Bu kod <strong>10 dakika</strong> geçerlidir. Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
        </div>`,
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

  /** İletişim formu: mesajı site sahibine iletir */
  async sendContactMessage(name: string, email: string, message: string) {
    // Alıcı: CONTACT_TO env'i, yoksa MAIL_FROM içindeki adres
    const to = process.env.CONTACT_TO || this.from.match(/<([^>]+)>/)?.[1] || this.from;
    await this.sendMail({
      to,
      subject: `İletişim formu: ${name}`,
      text: `Gönderen: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>Gönderen:</strong> ${name} &lt;${email}&gt;</p><p>${String(message).replace(/\n/g, '<br>')}</p>`,
    });
    return { success: true };
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    if (!this.apiKey) {
      // Lokal geliştirmede RESEND_API_KEY tanımlı değilse gerçekten göndermek yerine
      // konsola yazıyoruz ki akış (kayıt/giriş/şifre sıfırlama) e-posta olmadan da çalışsın.
      this.logger.warn(
        `RESEND_API_KEY tanımlı değil — e-posta gönderilmedi (sadece konsola yazıldı). Alıcı: ${options.to} | Konu: ${options.subject}`,
      );
      this.logger.warn(options.text);
      return { id: 'dev-no-op' };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Resend API hatası (HTTP ${res.status})`);
      }

      this.logger.log(`E-posta gönderildi (Resend id: ${data?.id}) → ${options.to}`);
      return data;
    } catch (error: any) {
      this.logger.error(`E-posta gönderme hatası: ${error.message}`);
      throw error;
    }
  }
}

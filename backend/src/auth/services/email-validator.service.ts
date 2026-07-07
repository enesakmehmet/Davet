import { Injectable, BadRequestException } from '@nestjs/common';
import { resolveMx } from 'dns/promises';

/**
 * Bilinen geçici/tek kullanımlık e-posta servisleri.
 * Kayıt formunda "asdasd@mailinator.com" gibi saçma/kaçamak adreslerle
 * hesap açılmasını engellemek için kullanılır.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org', 'yopmail.com',
  'yopmail.fr', 'throwawaymail.com', 'trashmail.com', 'trashmail.me', 'getnada.com',
  'sharklasers.com', 'dispostable.com', 'fakeinbox.com', 'maildrop.cc', 'mohmal.com',
  'moakt.com', 'mailcatch.com', 'discard.email', 'discardmail.com', 'spamgourmet.com',
  'mintemail.com', 'emailondeck.com', 'crazymailing.com', 'burnermail.io', 'mailnesia.com',
  '33mail.com', 'mytemp.email', 'tempmailo.com', 'inboxbear.com', 'tempinbox.com',
  'moakt.cc', 'tempr.email', 'anonaddy.me', 'luxusmail.org', 'mailtemp.info',
]);

@Injectable()
export class EmailValidatorService {
  /**
   * E-posta adresinin gerçekten ulaşılabilir olduğunu doğrular:
   * 1) bilinen geçici/tek kullanımlık servis değil,
   * 2) domain'in geçerli bir MX kaydı var (yani gerçekten posta alabilir).
   * İkisinden biri başarısız olursa BadRequestException fırlatır.
   */
  async assertRegistrable(email: string): Promise<void> {
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) {
      throw new BadRequestException('Geçerli bir e-posta adresi giriniz.');
    }

    if (DISPOSABLE_DOMAINS.has(domain)) {
      throw new BadRequestException(
        'Geçici/tek kullanımlık e-posta servisleriyle kayıt olunamaz. Lütfen kalıcı bir e-posta adresi kullanın.',
      );
    }

    try {
      const records = await resolveMx(domain);
      if (!records || records.length === 0) {
        throw new Error('no-mx-records');
      }
    } catch {
      throw new BadRequestException(
        'Bu e-posta adresine ulaşılamıyor. Lütfen geçerli, gerçek bir e-posta adresi girin.',
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { IStorageProvider } from './providers/storage.provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Injectable()
export class StorageService {
  private activeProvider: IStorageProvider;

  constructor(private localProvider: LocalStorageProvider) {
    // Burada ENV değerine göre provider dinamik seçilebilir:
    // S3Provider, CloudflareR2Provider vb.
    // Şimdilik Local kullanıyoruz.
    this.activeProvider = localProvider;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.activeProvider.uploadFile(file);
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    return this.activeProvider.deleteFile(fileUrl);
  }
}

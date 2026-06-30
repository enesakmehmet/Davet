import { Injectable } from '@nestjs/common';
import { IStorageProvider } from './storage.provider.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadPath = path.join(__dirname, '..', '..', '..', 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Dosya adını güvenli hale getir (boşluk/Türkçe karakter sorunlarını önle)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(this.uploadPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    // Dosyalar backend (ServeStaticModule) tarafından /uploads altında sunulur.
    const base = process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${base}/uploads/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const filename = fileUrl.split('/').pop();
      if (!filename) return false;
      
      const filePath = path.join(this.uploadPath, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

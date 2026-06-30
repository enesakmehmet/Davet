import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { StorageService } from './storage.service';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, StorageService, LocalStorageProvider]
})
export class AssetsModule {}

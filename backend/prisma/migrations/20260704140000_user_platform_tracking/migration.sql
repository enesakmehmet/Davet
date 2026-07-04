-- Admin panelde mobil/web kullanımını takip etmek için (opsiyonel, mevcut veriyi etkilemez)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastPlatform" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);

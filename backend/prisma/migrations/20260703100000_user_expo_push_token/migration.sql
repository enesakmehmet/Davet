-- Mobil push bildirimleri için Expo push token (opsiyonel, mevcut veriyi etkilemez)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "expoPushToken" TEXT;

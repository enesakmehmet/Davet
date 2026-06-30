-- Asset: dosya içeriğini DB'de sakla (Railway'de kalıcı), içerik tipi ekle
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "mime" TEXT;
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "data" BYTEA;
ALTER TABLE "Asset" ALTER COLUMN "url" SET DEFAULT '';

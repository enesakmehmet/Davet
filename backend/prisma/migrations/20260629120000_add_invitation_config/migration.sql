-- Yeni form tabanlı davet editörünün ayarlarını saklamak için config alanı
ALTER TABLE "Invitation" ADD COLUMN "config" JSONB;

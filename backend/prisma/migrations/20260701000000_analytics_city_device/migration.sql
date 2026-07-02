-- Geçmişte migration olmadan (db push/manuel) eklenen analitik kolonlarını
-- migration geçmişine dahil eder. IF NOT EXISTS sayesinde kolonların zaten
-- var olduğu ortamlarda (lokal + Railway) güvenle, veri kaybı olmadan çalışır.
ALTER TABLE "Analytics" ADD COLUMN IF NOT EXISTS "cities" JSONB;
ALTER TABLE "Analytics" ADD COLUMN IF NOT EXISTS "devices" JSONB;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "city" TEXT;

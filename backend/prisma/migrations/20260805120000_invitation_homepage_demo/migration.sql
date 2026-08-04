-- Anasayfadaki "Demoyu İncele" butonunun hangi gerçek davetiyeyi göstereceğini işaretler (admin panelden tek tıkla seçilir)
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "isHomepageDemo" BOOLEAN NOT NULL DEFAULT false;

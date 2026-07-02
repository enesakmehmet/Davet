-- RSVP formuna yemek tercihi ve alerji notu alanları (opsiyonel, mevcut veriyi etkilemez)
ALTER TABLE "Guest" ADD COLUMN "mealPreference" TEXT;
ALTER TABLE "Guest" ADD COLUMN "allergyNote" TEXT;

-- Bildirimi ilgili davetle ilişkilendirir (mobil push'a dokununca doğrudan o davete gitmek için)
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "invitationId" TEXT;

-- WhatsApp destek butonu tıklama kaydı (admin panel takibi için)
CREATE TABLE IF NOT EXISTS "WhatsappClick" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WhatsappClick_createdAt_idx" ON "WhatsappClick"("createdAt");

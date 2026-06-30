-- Kullanıcı rol & durum alanları
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- Site geneli sayfa görüntüleme takibi
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sessionId" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageView_path_idx" ON "PageView"("path");
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

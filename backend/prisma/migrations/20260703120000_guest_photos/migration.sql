-- Misafir albümü: davete gelen misafirlerin yüklediği fotoğraflar
CREATE TABLE "GuestPhoto" (
    "id" TEXT NOT NULL,
    "guestName" TEXT,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitationId" TEXT NOT NULL,

    CONSTRAINT "GuestPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GuestPhoto_invitationId_idx" ON "GuestPhoto"("invitationId");

ALTER TABLE "GuestPhoto" ADD CONSTRAINT "GuestPhoto_invitationId_fkey"
  FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

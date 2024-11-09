-- CreateTable
CREATE TABLE "PixelTrack" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referer" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PixelTrack_pkey" PRIMARY KEY ("id")
);

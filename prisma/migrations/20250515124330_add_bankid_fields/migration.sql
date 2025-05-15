-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "password" TEXT,
    "userType" TEXT NOT NULL,
    "personalNumber" TEXT,
    "bankIdVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "updatedAt", "userType") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "updatedAt", "userType" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_personalNumber_key" ON "User"("personalNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

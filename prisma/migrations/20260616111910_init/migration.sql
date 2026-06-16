-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codeProduit" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "norme" TEXT,
    "sommeil" TEXT,
    "acheteur" TEXT,
    "familleAchat" TEXT,
    "stock" REAL,
    "valeurStock" REAL,
    "consommationAnnuelle" REAL,
    "pmpa" REAL,
    "miniCommande" REAL,
    "qteReappro" REAL,
    "delaiReappro" TEXT,
    "preferredMode" TEXT NOT NULL DEFAULT 'auto',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equivalence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "refFabricant" TEXT NOT NULL,
    "fabricant" TEXT NOT NULL,
    "equivalenceCode" TEXT,
    "famille" TEXT,
    "qteReappro" REAL,
    "poids" REAL,
    "uniteAchat" TEXT,
    "uniteStock" TEXT,
    "sommeil" TEXT,
    "prixActuel" REAL,
    "prixCible" REAL,
    "prixObtenu" REAL,
    "dateMAJPrix" DATETIME,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equivalence_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "campagne" TEXT NOT NULL,
    "objectifPrix" REAL,
    "objectifReductionPct" REAL,
    "batna" REAL,
    "deadline" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'A_LANCER',
    "prixFinal" REAL,
    "notesConditions" TEXT,
    "prochaineAction" TEXT,
    "dateRelance" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Negotiation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NegotiationStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "negotiationId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "NegotiationStep_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "Negotiation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_codeProduit_key" ON "Product"("codeProduit");

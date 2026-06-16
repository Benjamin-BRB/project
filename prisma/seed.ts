import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl } as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.negotiationStep.deleteMany();
  await prisma.negotiation.deleteMany();
  await prisma.equivalence.deleteMany();
  await prisma.product.deleteMany();

  const today = new Date();
  const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        codeProduit: "VIS-001",
        libelle: "Vis hexagonale DIN 933 M8x30 classe 8.8 zinguée",
        norme: "DIN933",
        sommeil: "N",
        acheteur: "Martin Dupont",
        familleAchat: "Visserie",
        stock: 5000,
        valeurStock: 750.0,
        consommationAnnuelle: 12000,
        pmpa: 0.148,
        miniCommande: 500,
        qteReappro: 2000,
        delaiReappro: "7J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "BLN-002",
        libelle: "Boulon M12x60 ISO 4017 acier inoxydable A2",
        norme: "ISO4017",
        sommeil: "N",
        acheteur: "Marie Leroy",
        familleAchat: "Boulonnerie",
        stock: 2000,
        valeurStock: 980.0,
        consommationAnnuelle: 8000,
        pmpa: 0.49,
        miniCommande: 200,
        qteReappro: 1000,
        delaiReappro: "10J",
        preferredMode: "manual",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "ECR-003",
        libelle: "Écrou frein NF EN 24032 M10 zingué",
        norme: "NFEN24032",
        sommeil: "N",
        acheteur: "Martin Dupont",
        familleAchat: "Visserie",
        stock: 8000,
        valeurStock: 640.0,
        consommationAnnuelle: 20000,
        pmpa: 0.08,
        miniCommande: 1000,
        qteReappro: 5000,
        delaiReappro: "5J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "RON-004",
        libelle: "Rondelle plate NFE 25-513 M6",
        norme: "NFE25-513",
        sommeil: "N",
        acheteur: "Sophie Bernard",
        familleAchat: "Visserie",
        stock: 15000,
        valeurStock: 375.0,
        consommationAnnuelle: 50000,
        pmpa: 0.025,
        miniCommande: 2000,
        qteReappro: 10000,
        delaiReappro: "5J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "GOU-005",
        libelle: "Goujon fileté DIN 975 M16 longueur 1000mm",
        norme: "DIN975",
        sommeil: "N",
        acheteur: "Marie Leroy",
        familleAchat: "Boulonnerie",
        stock: 300,
        valeurStock: 540.0,
        consommationAnnuelle: 600,
        pmpa: 1.8,
        miniCommande: 50,
        qteReappro: 100,
        delaiReappro: "14J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "CHV-006",
        libelle: "Cheville à expansion 10x100 béton haute résistance",
        norme: null,
        sommeil: "N",
        acheteur: "Sophie Bernard",
        familleAchat: "Fixation",
        stock: 1200,
        valeurStock: 360.0,
        consommationAnnuelle: 3000,
        pmpa: 0.3,
        miniCommande: 100,
        qteReappro: 500,
        delaiReappro: "7J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "ANG-007",
        libelle: "Équerres de fixation acier galvanisé 60x60x40mm",
        norme: null,
        sommeil: "N",
        acheteur: "Martin Dupont",
        familleAchat: "Fixation",
        stock: 400,
        valeurStock: 280.0,
        consommationAnnuelle: 1500,
        pmpa: 0.7,
        miniCommande: 50,
        qteReappro: 200,
        delaiReappro: "10J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "VIS-008",
        libelle: "Vis à tête fraisée cruciforme DIN 965 M5x20 inox A2",
        norme: "DIN965",
        sommeil: "O",
        acheteur: "Sophie Bernard",
        familleAchat: "Visserie",
        stock: 3000,
        valeurStock: 240.0,
        consommationAnnuelle: 0,
        pmpa: 0.08,
        miniCommande: 500,
        qteReappro: 2000,
        delaiReappro: "7J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "ECR-009",
        libelle: "Écrou hexagonal ISO 4032 M20 classe 8 zingué",
        norme: "ISO4032",
        sommeil: "N",
        acheteur: "Marie Leroy",
        familleAchat: "Boulonnerie",
        stock: 800,
        valeurStock: 720.0,
        consommationAnnuelle: 2000,
        pmpa: 0.45,
        miniCommande: 100,
        qteReappro: 500,
        delaiReappro: "7J",
        preferredMode: "auto",
      },
    }),
    prisma.product.create({
      data: {
        codeProduit: "TIG-010",
        libelle: "Tige filetée M12 longueur 3000mm classe 4.8",
        norme: null,
        sommeil: "N",
        acheteur: "Martin Dupont",
        familleAchat: "Boulonnerie",
        stock: 150,
        valeurStock: 675.0,
        consommationAnnuelle: 500,
        pmpa: 4.5,
        miniCommande: 10,
        qteReappro: 50,
        delaiReappro: "14J",
        preferredMode: "auto",
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create equivalences for 4 products
  // Product 0: VIS-001 (Vis hexagonale DIN 933)
  const equiv1 = await prisma.equivalence.createMany({
    data: [
      {
        productId: products[0].id,
        refFabricant: "WURTH-0907420830",
        fabricant: "WURTH",
        equivalenceCode: "DIN933-M8x30-88",
        famille: "Visserie",
        qteReappro: 2000,
        poids: 0.021,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.142,
        prixCible: 0.128,
        prixObtenu: null,
        isPreferred: false,
      },
      {
        productId: products[0].id,
        refFabricant: "BOSSARD-1028735",
        fabricant: "BOSSARD",
        equivalenceCode: "DIN933-M8x30",
        famille: "Visserie",
        qteReappro: 1000,
        poids: 0.021,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.135,
        prixCible: 0.12,
        prixObtenu: null,
        isPreferred: false,
      },
      {
        productId: products[0].id,
        refFabricant: "BUFAB-VH833088",
        fabricant: "BUFAB",
        equivalenceCode: "VH8x30-88Z",
        famille: "Visserie",
        qteReappro: 2000,
        poids: 0.021,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.139,
        prixCible: 0.125,
        prixObtenu: null,
        isPreferred: false,
      },
    ],
  });

  // Product 1: BLN-002 (Boulon M12x60 ISO 4017) - preferredMode=manual, set one isPreferred=true
  await prisma.equivalence.createMany({
    data: [
      {
        productId: products[1].id,
        refFabricant: "FACOM-B.12X60ISO",
        fabricant: "FACOM",
        equivalenceCode: "ISO4017-M12x60-A2",
        famille: "Boulonnerie",
        qteReappro: 500,
        poids: 0.085,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.52,
        prixCible: 0.47,
        prixObtenu: 0.48,
        isPreferred: true,
      },
      {
        productId: products[1].id,
        refFabricant: "WURTH-0157126021",
        fabricant: "WURTH",
        equivalenceCode: "ISO4017-M12x60",
        famille: "Boulonnerie",
        qteReappro: 1000,
        poids: 0.085,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.49,
        prixCible: 0.44,
        prixObtenu: null,
        isPreferred: false,
      },
    ],
  });

  // Product 2: ECR-003 (Écrou frein NF EN 24032)
  await prisma.equivalence.createMany({
    data: [
      {
        productId: products[2].id,
        refFabricant: "BOSSARD-3003456",
        fabricant: "BOSSARD",
        equivalenceCode: "NFEN24032-M10",
        famille: "Visserie",
        qteReappro: 5000,
        poids: 0.008,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.076,
        prixCible: 0.068,
        prixObtenu: null,
        isPreferred: false,
      },
      {
        productId: products[2].id,
        refFabricant: "STANLEY-ECF-M10Z",
        fabricant: "STANLEY",
        equivalenceCode: "ECF-M10-ZN",
        famille: "Visserie",
        qteReappro: 3000,
        poids: 0.008,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.082,
        prixCible: 0.074,
        prixObtenu: null,
        isPreferred: false,
      },
      {
        productId: products[2].id,
        refFabricant: "BUFAB-EN24032M10",
        fabricant: "BUFAB",
        equivalenceCode: "EN24032-M10Z",
        famille: "Visserie",
        qteReappro: 5000,
        poids: 0.008,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.079,
        prixCible: 0.071,
        prixObtenu: null,
        isPreferred: false,
      },
    ],
  });

  // Product 3: RON-004 (Rondelle plate NFE 25-513)
  await prisma.equivalence.createMany({
    data: [
      {
        productId: products[3].id,
        refFabricant: "WURTH-0417206",
        fabricant: "WURTH",
        equivalenceCode: "NFE25513-M6",
        famille: "Visserie",
        qteReappro: 10000,
        poids: 0.002,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.022,
        prixCible: 0.019,
        prixObtenu: null,
        isPreferred: false,
      },
      {
        productId: products[3].id,
        refFabricant: "BOSSARD-5002341",
        fabricant: "BOSSARD",
        equivalenceCode: "RPL-M6-Z",
        famille: "Visserie",
        qteReappro: 10000,
        poids: 0.002,
        uniteAchat: "PCE",
        uniteStock: "PCE",
        sommeil: "N",
        prixActuel: 0.024,
        prixCible: 0.021,
        prixObtenu: null,
        isPreferred: false,
      },
    ],
  });

  console.log("Created equivalences");

  // Create negotiations
  const neg1 = await prisma.negotiation.create({
    data: {
      productId: products[0].id, // VIS-001
      campagne: "2026",
      objectifPrix: 0.13,
      objectifReductionPct: 12.16,
      batna: 0.14,
      deadline: in15Days,
      statut: "EN_COURS",
      prochaineAction: "Relancer BOSSARD pour confirmation du prix plancher",
      dateRelance: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      steps: {
        create: [
          {
            date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            action: "Appel téléphonique initial",
            note: "Contact établi avec le responsable commercial BOSSARD. Demande de grille tarifaire annuelle.",
          },
          {
            date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
            action: "Réception offre initiale",
            note: "Offre reçue à 0.138€/pce. Demande d'effort supplémentaire transmise. Objectif : 0.130€.",
          },
          {
            date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
            action: "Contre-proposition envoyée",
            note: "Envoi de notre volume prévisionnel 2026 pour appuyer la demande de remise. En attente de retour.",
          },
        ],
      },
    },
  });

  const neg2 = await prisma.negotiation.create({
    data: {
      productId: products[2].id, // ECR-003
      campagne: "2026",
      objectifPrix: 0.072,
      objectifReductionPct: 10.0,
      batna: 0.08,
      deadline: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000),
      statut: "A_LANCER",
      prochaineAction: "Contacter les 3 fournisseurs référencés pour mise en concurrence",
    },
  });

  const neg3 = await prisma.negotiation.create({
    data: {
      productId: products[1].id, // BLN-002
      campagne: "2026",
      objectifPrix: 0.46,
      objectifReductionPct: 6.12,
      batna: 0.49,
      deadline: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
      statut: "CLOTURE_GAGNE",
      prixFinal: 0.48,
      notesConditions: "Accord obtenu avec FACOM à 0.48€/pce pour 1000 unités minimum. Contrat valable jusqu'au 31/12/2026. Livraison en J+5.",
      steps: {
        create: [
          {
            date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
            action: "Lancement de la négociation",
            note: "Consultation de 3 fournisseurs : FACOM, WURTH, BOSSARD.",
          },
          {
            date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
            action: "Réception des offres",
            note: "FACOM: 0.52€ | WURTH: 0.49€ | BOSSARD: 0.51€. WURTH meilleur prix.",
          },
          {
            date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            action: "Mise en concurrence",
            note: "Annonce du meilleur prix à tous. FACOM descend à 0.48€ avec délai J+5 (vs J+10 pour WURTH).",
          },
          {
            date: new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000),
            action: "Accord final",
            note: "Signature bon de commande avec FACOM. Prix 0.48€/pce valable 12 mois.",
          },
        ],
      },
    },
  });

  console.log(`Created 3 negotiations`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

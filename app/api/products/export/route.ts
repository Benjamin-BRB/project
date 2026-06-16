import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? "";
  const famille = searchParams.get("famille") ?? "";
  const acheteur = searchParams.get("acheteur") ?? "";
  const sommeil = searchParams.get("sommeil") ?? "";
  const norme = searchParams.get("norme") ?? "";

  const where: any = {};
  if (search) {
    where.OR = [
      { codeProduit: { contains: search } },
      { libelle: { contains: search } },
    ];
  }
  if (famille) where.familleAchat = famille;
  if (acheteur) where.acheteur = acheteur;
  if (sommeil) where.sommeil = sommeil;
  if (norme) where.norme = { contains: norme };

  const products = await prisma.product.findMany({
    where,
    include: { equivalences: true },
    orderBy: { codeProduit: "asc" },
  });

  const headers = [
    "Code Produit",
    "Libellé",
    "Norme",
    "Famille Achat",
    "Acheteur",
    "Sommeil",
    "Stock",
    "Valeur Stock",
    "Conso. Annuelle",
    "PMPA",
    "Mini Commande",
    "Qté Réappro",
    "Délai Réappro",
    "Nb Équivalences",
    "Meilleur Prix",
    "Fournisseur Préféré",
  ];

  const rows = products.map((p) => {
    const withPrice = p.equivalences.filter(
      (e) => e.prixActuel !== null && e.prixActuel !== undefined
    );
    const best =
      withPrice.length > 0
        ? withPrice.reduce((a, b) =>
            (a.prixActuel ?? 999) < (b.prixActuel ?? 999) ? a : b
          )
        : null;
    const preferred =
      p.preferredMode === "manual"
        ? p.equivalences.find((e) => e.isPreferred)
        : best;

    return [
      p.codeProduit,
      `"${p.libelle.replace(/"/g, '""')}"`,
      p.norme ?? "",
      p.familleAchat ?? "",
      p.acheteur ?? "",
      p.sommeil ?? "",
      p.stock ?? "",
      p.valeurStock ?? "",
      p.consommationAnnuelle ?? "",
      p.pmpa ?? "",
      p.miniCommande ?? "",
      p.qteReappro ?? "",
      p.delaiReappro ?? "",
      p.equivalences.length,
      best?.prixActuel ?? "",
      preferred?.fabricant ?? "",
    ].join(";");
  });

  const csv = [headers.join(";"), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produits-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

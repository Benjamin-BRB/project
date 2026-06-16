import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const statut = searchParams.get("statut") ?? "";
  const campagne = searchParams.get("campagne") ?? "";
  const famille = searchParams.get("famille") ?? "";
  const search = searchParams.get("search") ?? "";

  const where: any = {};
  if (statut) where.statut = statut;
  if (campagne) where.campagne = campagne;
  if (famille) where.product = { familleAchat: famille };
  if (search) {
    where.OR = [
      { product: { codeProduit: { contains: search } } },
      { product: { libelle: { contains: search } } },
    ];
  }

  const negotiations = await prisma.negotiation.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Code Produit",
    "Libellé",
    "Famille Achat",
    "Campagne",
    "Statut",
    "Objectif Prix",
    "Objectif Réduction %",
    "BATNA",
    "Deadline",
    "PMPA",
    "Conso. Annuelle",
    "Éco. Attendues",
    "Prix Final",
    "Éco. Réalisées",
    "Taux Atteinte %",
  ];

  const rows = negotiations.map((n) => {
    const pmpa = n.product.pmpa ?? 0;
    const conso = n.product.consommationAnnuelle ?? 0;
    const objPrix =
      n.objectifPrix ??
      (n.objectifReductionPct
        ? pmpa * (1 - n.objectifReductionPct / 100)
        : null);
    const ecoAttendues = objPrix !== null ? (pmpa - objPrix) * conso : null;
    const ecoRealisees =
      n.prixFinal !== null ? (pmpa - n.prixFinal) * conso : null;
    const taux =
      ecoAttendues && ecoRealisees && ecoAttendues > 0
        ? (ecoRealisees / ecoAttendues) * 100
        : null;

    return [
      n.product.codeProduit,
      `"${n.product.libelle.replace(/"/g, '""')}"`,
      n.product.familleAchat ?? "",
      n.campagne,
      n.statut,
      objPrix?.toFixed(4) ?? "",
      n.objectifReductionPct?.toFixed(2) ?? "",
      n.batna?.toFixed(4) ?? "",
      n.deadline ? new Date(n.deadline).toLocaleDateString("fr-FR") : "",
      pmpa.toFixed(4),
      conso,
      ecoAttendues?.toFixed(2) ?? "",
      n.prixFinal?.toFixed(4) ?? "",
      ecoRealisees?.toFixed(2) ?? "",
      taux?.toFixed(1) ?? "",
    ].join(";");
  });

  const csv = [headers.join(";"), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="negociations-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

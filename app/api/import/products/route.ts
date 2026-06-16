import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products: any[] = body.products ?? [];

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const p of products) {
      try {
        const codeProduit = p.codeProduit ?? p["Code article"] ?? p.id_prd;
        if (!codeProduit) {
          errors.push(`Ligne ignorée : code produit manquant`);
          continue;
        }

        const data = {
          libelle: p.libelle ?? p["Libellé"] ?? "",
          norme: p.norme ?? null,
          sommeil: p.sommeil ?? p["Sommeil"] ?? null,
          acheteur: p.acheteur ?? p["Acheteur"] ?? null,
          familleAchat: p.familleAchat ?? p["Famille Achat"] ?? null,
          stock: p.stock !== undefined ? parseFloat(p.stock) || null : undefined,
          valeurStock:
            p.valeurStock !== undefined
              ? parseFloat(p.valeurStock) || null
              : undefined,
          consommationAnnuelle:
            p.consommationAnnuelle !== undefined
              ? parseFloat(p.consommationAnnuelle) || null
              : undefined,
          pmpa:
            p.pmpa !== undefined ? parseFloat(p.pmpa) || null : undefined,
          miniCommande:
            p.miniCommande !== undefined
              ? parseFloat(p.miniCommande) || null
              : undefined,
          qteReappro:
            p.qteReappro !== undefined
              ? parseFloat(p.qteReappro) || null
              : undefined,
          delaiReappro: p.delaiReappro ?? p["Délai de réappro"] ?? null,
        };

        // Remove undefined keys
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([, v]) => v !== undefined)
        );

        const existing = await prisma.product.findUnique({
          where: { codeProduit },
        });

        if (existing) {
          await prisma.product.update({
            where: { codeProduit },
            data: cleanData as any,
          });
          updated++;
        } else {
          await prisma.product.create({
            data: { codeProduit, libelle: cleanData.libelle ?? "", ...cleanData } as any,
          });
          created++;
        }
      } catch (err: any) {
        errors.push(`Erreur pour ${p.codeProduit ?? "?"}: ${err.message}`);
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur d'import" },
      { status: 400 }
    );
  }
}

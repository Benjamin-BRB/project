import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const equivalences: any[] = body.equivalences ?? [];

    let linked = 0;
    let unmatched = 0;
    const errors: string[] = [];

    for (const e of equivalences) {
      try {
        const codeProduit =
          e.codeProduit ?? e["Produit"] ?? e.productCode ?? null;
        if (!codeProduit) {
          errors.push(`Ligne ignorée : code produit manquant`);
          continue;
        }

        const product = await prisma.product.findUnique({
          where: { codeProduit },
        });

        if (!product) {
          unmatched++;
          errors.push(`Produit non trouvé : ${codeProduit}`);
          continue;
        }

        const refFabricant = e.refFabricant ?? e["Ref Fabricant"] ?? "";
        const fabricant = e.fabricant ?? e["Fabricant"] ?? "";

        if (!refFabricant || !fabricant) {
          errors.push(
            `Ligne ignorée pour ${codeProduit}: ref ou fabricant manquant`
          );
          continue;
        }

        // Check if this equivalence already exists (do NOT overwrite prix or isPreferred)
        const existing = await prisma.equivalence.findFirst({
          where: { productId: product.id, refFabricant, fabricant },
        });

        if (existing) {
          // Update non-prix fields only
          await prisma.equivalence.update({
            where: { id: existing.id },
            data: {
              equivalenceCode:
                e.equivalenceCode ?? e["Equivalence"] ?? existing.equivalenceCode,
              famille: e.famille ?? e["Famille"] ?? existing.famille,
              qteReappro:
                e.qteReappro !== undefined
                  ? parseFloat(e.qteReappro) || null
                  : existing.qteReappro,
              poids:
                e.poids !== undefined
                  ? parseFloat(e.poids) || null
                  : existing.poids,
              uniteAchat:
                e.uniteAchat ?? e["Unite Achat"] ?? existing.uniteAchat,
              uniteStock:
                e.uniteStock ?? e["Unité Stock"] ?? existing.uniteStock,
              sommeil: e.sommeil ?? e["Sommeil"] ?? existing.sommeil,
            },
          });
        } else {
          await prisma.equivalence.create({
            data: {
              productId: product.id,
              refFabricant,
              fabricant,
              equivalenceCode:
                e.equivalenceCode ?? e["Equivalence"] ?? null,
              famille: e.famille ?? e["Famille"] ?? null,
              qteReappro:
                e.qteReappro !== undefined
                  ? parseFloat(e.qteReappro) || null
                  : null,
              poids:
                e.poids !== undefined ? parseFloat(e.poids) || null : null,
              uniteAchat: e.uniteAchat ?? e["Unite Achat"] ?? null,
              uniteStock: e.uniteStock ?? e["Unité Stock"] ?? null,
              sommeil: e.sommeil ?? e["Sommeil"] ?? null,
            },
          });
        }
        linked++;
      } catch (err: any) {
        errors.push(`Erreur: ${err.message}`);
      }
    }

    return NextResponse.json({ linked, unmatched, errors });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur d'import" },
      { status: 400 }
    );
  }
}

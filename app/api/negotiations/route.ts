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
  if (famille) {
    where.product = { familleAchat: famille };
  }
  if (search) {
    where.OR = [
      { product: { codeProduit: { contains: search } } },
      { product: { libelle: { contains: search } } },
    ];
  }

  const negotiations = await prisma.negotiation.findMany({
    where,
    include: {
      product: { include: { equivalences: true } },
      steps: { orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(negotiations);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      campagne,
      objectifPrix,
      objectifReductionPct,
      batna,
      deadline,
    } = body;

    const negotiation = await prisma.negotiation.create({
      data: {
        productId: parseInt(productId),
        campagne,
        objectifPrix: objectifPrix ? parseFloat(objectifPrix) : null,
        objectifReductionPct: objectifReductionPct
          ? parseFloat(objectifReductionPct)
          : null,
        batna: batna ? parseFloat(batna) : null,
        deadline: deadline ? new Date(deadline) : null,
        statut: "A_LANCER",
      },
      include: {
        product: true,
        steps: true,
      },
    });

    return NextResponse.json(negotiation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la création" },
      { status: 400 }
    );
  }
}

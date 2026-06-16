import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const negotiation = await prisma.negotiation.findUnique({
    where: { id: parseInt(id) },
    include: {
      product: { include: { equivalences: { orderBy: { prixActuel: "asc" } } } },
      steps: { orderBy: { date: "asc" } },
    },
  });

  if (!negotiation) {
    return NextResponse.json(
      { error: "Négociation non trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json(negotiation);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    const data: any = {};
    if (body.campagne !== undefined) data.campagne = body.campagne;
    if (body.objectifPrix !== undefined)
      data.objectifPrix = body.objectifPrix ? parseFloat(body.objectifPrix) : null;
    if (body.objectifReductionPct !== undefined)
      data.objectifReductionPct = body.objectifReductionPct
        ? parseFloat(body.objectifReductionPct)
        : null;
    if (body.batna !== undefined)
      data.batna = body.batna ? parseFloat(body.batna) : null;
    if (body.deadline !== undefined)
      data.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.statut !== undefined) data.statut = body.statut;
    if (body.prixFinal !== undefined)
      data.prixFinal = body.prixFinal ? parseFloat(body.prixFinal) : null;
    if (body.notesConditions !== undefined)
      data.notesConditions = body.notesConditions;
    if (body.prochaineAction !== undefined)
      data.prochaineAction = body.prochaineAction;
    if (body.dateRelance !== undefined)
      data.dateRelance = body.dateRelance ? new Date(body.dateRelance) : null;

    const negotiation = await prisma.negotiation.update({
      where: { id: parseInt(id) },
      data,
      include: {
        product: { include: { equivalences: true } },
        steps: { orderBy: { date: "asc" } },
      },
    });

    return NextResponse.json(negotiation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la mise à jour" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.negotiation.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la suppression" },
      { status: 400 }
    );
  }
}

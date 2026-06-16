import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    // Only allow updating prix fields and related
    const { prixActuel, prixCible, prixObtenu, dateMAJPrix } = body;
    const equivalence = await prisma.equivalence.update({
      where: { id: parseInt(id) },
      data: {
        ...(prixActuel !== undefined && { prixActuel }),
        ...(prixCible !== undefined && { prixCible }),
        ...(prixObtenu !== undefined && { prixObtenu }),
        dateMAJPrix: dateMAJPrix ? new Date(dateMAJPrix) : new Date(),
      },
    });
    return NextResponse.json(equivalence);
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
    await prisma.equivalence.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la suppression" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const equivalence = await prisma.equivalence.findUnique({
      where: { id: parseInt(id) },
    });

    if (!equivalence) {
      return NextResponse.json(
        { error: "Équivalence non trouvée" },
        { status: 404 }
      );
    }

    // Set all equivalences of this product to false
    await prisma.equivalence.updateMany({
      where: { productId: equivalence.productId },
      data: { isPreferred: false },
    });

    // Set this one to preferred and product to manual mode
    const [updated] = await Promise.all([
      prisma.equivalence.update({
        where: { id: parseInt(id) },
        data: { isPreferred: true },
      }),
      prisma.product.update({
        where: { id: equivalence.productId },
        data: { preferredMode: "manual" },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur" },
      { status: 400 }
    );
  }
}

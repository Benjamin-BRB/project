import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { preferredMode: "auto" },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur" },
      { status: 400 }
    );
  }
}

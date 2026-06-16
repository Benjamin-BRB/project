import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const equivalence = await prisma.equivalence.create({ data: body });
    return NextResponse.json(equivalence, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la création" },
      { status: 400 }
    );
  }
}

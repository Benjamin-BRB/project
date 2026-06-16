import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { date, action, note } = body;

    const step = await prisma.negotiationStep.create({
      data: {
        negotiationId: parseInt(id),
        date: date ? new Date(date) : new Date(),
        action,
        note: note ?? null,
      },
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la création" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const famille = searchParams.get("famille") ?? "";
  const acheteur = searchParams.get("acheteur") ?? "";
  const sommeil = searchParams.get("sommeil") ?? "";
  const norme = searchParams.get("norme") ?? "";

  const where: any = {};

  if (search) {
    where.OR = [
      { codeProduit: { contains: search } },
      { libelle: { contains: search } },
    ];
  }
  if (famille) where.familleAchat = famille;
  if (acheteur) where.acheteur = acheteur;
  if (sommeil) where.sommeil = sommeil;
  if (norme) where.norme = { contains: norme };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        equivalences: true,
        _count: { select: { negotiations: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { codeProduit: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: body,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la création" },
      { status: 400 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import NewNegotiationClient from "./NewNegotiationClient";

interface PageProps {
  searchParams: Promise<{ productId?: string }>;
}

export default async function NewNegotiationPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const preselectedProductId = sp.productId ? parseInt(sp.productId) : null;

  const products = await prisma.product.findMany({
    where: { sommeil: { not: "O" } },
    select: {
      id: true,
      codeProduit: true,
      libelle: true,
      pmpa: true,
      consommationAnnuelle: true,
      familleAchat: true,
    },
    orderBy: { codeProduit: "asc" },
  });

  const preselectedProduct = preselectedProductId
    ? products.find((p) => p.id === preselectedProductId) ?? null
    : null;

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Nouvelle négociation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Créer une nouvelle négociation achat
          </p>
        </div>

        <NewNegotiationClient
          products={products as any[]}
          preselectedProduct={preselectedProduct as any}
        />
      </div>
    </div>
  );
}

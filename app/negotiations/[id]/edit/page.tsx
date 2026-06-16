import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditNegotiationClient from "./EditNegotiationClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNegotiationPage({ params }: PageProps) {
  const { id } = await params;
  const negotiation = await prisma.negotiation.findUnique({
    where: { id: parseInt(id) },
    include: { product: true },
  });

  if (!negotiation) notFound();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Modifier la négociation</h1>
          <p className="text-slate-500 text-sm mt-1">
            {negotiation.product.codeProduit} — {negotiation.product.libelle.slice(0, 60)}
          </p>
        </div>
        <EditNegotiationClient negotiation={negotiation as any} />
      </div>
    </div>
  );
}

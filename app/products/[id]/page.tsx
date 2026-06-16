import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatNumber, getPreferredEquivalence } from "@/lib/utils";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      equivalences: { orderBy: { prixActuel: "asc" } },
      negotiations: {
        include: { steps: { orderBy: { date: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const activeNegotiation = product.negotiations.find(
    (n) => n.statut === "EN_COURS" || n.statut === "A_LANCER" || n.statut === "EN_ATTENTE"
  );

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Produits
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium">{product.codeProduit}</span>
      </div>

      {/* Product header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">{product.codeProduit}</h1>
              {product.norme && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {product.norme}
                </span>
              )}
              {product.sommeil === "O" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  Sommeil
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-1">{product.libelle}</p>
          </div>
          <div className="flex gap-2">
            {!activeNegotiation && (
              <Link
                href={`/negotiations/new?productId=${product.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer une négociation
              </Link>
            )}
            {activeNegotiation && (
              <Link
                href={`/negotiations/${activeNegotiation.id}`}
                className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Voir la négociation en cours
              </Link>
            )}
          </div>
        </div>

        {/* Product fields grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Famille achat</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{product.familleAchat ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Acheteur</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{product.acheteur ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Stock</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {product.stock !== null ? formatNumber(product.stock, 0) : "—"} unités
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Valeur stock</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {formatCurrency(product.valeurStock)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Conso. annuelle</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {product.consommationAnnuelle !== null
                ? `${formatNumber(product.consommationAnnuelle, 0)} unités/an`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">PMPA</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {formatCurrency(product.pmpa)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Mini commande</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {product.miniCommande !== null ? formatNumber(product.miniCommande, 0) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Qté réappro</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {product.qteReappro !== null ? formatNumber(product.qteReappro, 0) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Délai réappro</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              {product.delaiReappro ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Equivalences - client component for interactivity */}
      <ProductDetailClient
        product={product as any}
        activeNegotiationId={activeNegotiation?.id}
      />

      {/* Negotiations history */}
      {product.negotiations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Historique des négociations
          </h2>
          <div className="space-y-2">
            {product.negotiations.map((neg) => (
              <Link
                key={neg.id}
                href={`/negotiations/${neg.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Campagne {neg.campagne}
                  </span>
                  {neg.prixFinal && (
                    <span className="ml-3 text-sm text-green-600">
                      Prix final : {formatCurrency(neg.prixFinal)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      neg.statut === "CLOTURE_GAGNE"
                        ? "bg-green-100 text-green-700"
                        : neg.statut === "CLOTURE_PERDU"
                        ? "bg-red-100 text-red-700"
                        : neg.statut === "EN_COURS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {neg.statut === "A_LANCER"
                      ? "À lancer"
                      : neg.statut === "EN_COURS"
                      ? "En cours"
                      : neg.statut === "CLOTURE_GAGNE"
                      ? "Clôturé - Gagné"
                      : neg.statut === "CLOTURE_PERDU"
                      ? "Clôturé - Perdu"
                      : "En attente"}
                  </span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

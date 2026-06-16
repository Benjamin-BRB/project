import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getPreferredEquivalence, formatCurrency, formatNumber } from "@/lib/utils";
import ProductsFilters from "./ProductsFilters";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    famille?: string;
    acheteur?: string;
    sommeil?: string;
    norme?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const search = sp.search ?? "";
  const famille = sp.famille ?? "";
  const acheteur = sp.acheteur ?? "";
  const sommeil = sp.sommeil ?? "";
  const norme = sp.norme ?? "";

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

  const [products, total, familles, acheteurs] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { equivalences: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { codeProduit: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { familleAchat: true },
      distinct: ["familleAchat"],
      where: { familleAchat: { not: null } },
      orderBy: { familleAchat: "asc" },
    }),
    prisma.product.findMany({
      select: { acheteur: true },
      distinct: ["acheteur"],
      where: { acheteur: { not: null } },
      orderBy: { acheteur: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("search", search);
  if (famille) exportParams.set("famille", famille);
  if (acheteur) exportParams.set("acheteur", acheteur);
  if (sommeil) exportParams.set("sommeil", sommeil);
  if (norme) exportParams.set("norme", norme);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produits</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} produit{total > 1 ? "s" : ""}
          </p>
        </div>
        <a
          href={`/api/products/export?${exportParams.toString()}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exporter CSV
        </a>
      </div>

      {/* Filters */}
      <ProductsFilters
        familles={familles.map((f) => f.familleAchat!)}
        acheteurs={acheteurs.map((a) => a.acheteur!)}
        currentFilters={{ search, famille, acheteur, sommeil, norme }}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Code article
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Libellé
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Norme
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Famille
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Acheteur
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Conso. ann.
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  PMPA
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Stock
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Équiv.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const preferred = getPreferredEquivalence(
                  product.equivalences,
                  product.preferredMode
                );
                const isSommeil = product.sommeil === "O";

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSommeil ? "opacity-60" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {product.codeProduit}
                      </Link>
                      {isSommeil && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                          Sommeil
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">
                      <span title={product.libelle}>
                        {product.libelle.length > 50
                          ? product.libelle.slice(0, 50) + "…"
                          : product.libelle}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {product.norme ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                          {product.norme}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {product.familleAchat ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {product.acheteur ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {product.consommationAnnuelle !== null
                        ? formatNumber(product.consommationAnnuelle, 0)
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatCurrency(product.pmpa)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {product.stock !== null ? formatNumber(product.stock, 0) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {product.equivalences.length === 0 ? (
                        <span className="text-slate-300 text-center block">—</span>
                      ) : (
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                            {product.equivalences.length}
                          </span>
                          {preferred?.prixActuel !== null &&
                            preferred?.prixActuel !== undefined && (
                              <p className="text-xs text-green-600 font-medium mt-0.5">
                                {formatCurrency(preferred.prixActuel)}
                              </p>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-400"
                  >
                    Aucun produit trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} sur {totalPages} &mdash; {total} résultats
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link
                  href={`/products?${new URLSearchParams({
                    ...Object.fromEntries(
                      Object.entries({ search, famille, acheteur, sommeil, norme }).filter(
                        ([, v]) => v
                      )
                    ),
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                >
                  Précédent
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/products?${new URLSearchParams({
                    ...Object.fromEntries(
                      Object.entries({ search, famille, acheteur, sommeil, norme }).filter(
                        ([, v]) => v
                      )
                    ),
                    page: String(page + 1),
                  }).toString()}`}
                  className="px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                >
                  Suivant
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

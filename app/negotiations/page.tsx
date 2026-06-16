import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import NegotiationsFilters from "./NegotiationsFilters";

interface PageProps {
  searchParams: Promise<{
    statut?: string;
    campagne?: string;
    famille?: string;
    search?: string;
  }>;
}

export default async function NegotiationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statut = sp.statut ?? "";
  const campagne = sp.campagne ?? "";
  const famille = sp.famille ?? "";
  const search = sp.search ?? "";

  const where: any = {};
  if (statut) where.statut = statut;
  if (campagne) where.campagne = campagne;
  if (famille) where.product = { familleAchat: famille };
  if (search) {
    where.OR = [
      { product: { codeProduit: { contains: search } } },
      { product: { libelle: { contains: search } } },
    ];
  }

  const [negotiations, campagnes, familles] = await Promise.all([
    prisma.negotiation.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.negotiation.findMany({
      select: { campagne: true },
      distinct: ["campagne"],
      orderBy: { campagne: "desc" },
    }),
    prisma.product.findMany({
      select: { familleAchat: true },
      distinct: ["familleAchat"],
      where: { familleAchat: { not: null } },
      orderBy: { familleAchat: "asc" },
    }),
  ]);

  const exportParams = new URLSearchParams();
  if (statut) exportParams.set("statut", statut);
  if (campagne) exportParams.set("campagne", campagne);
  if (famille) exportParams.set("famille", famille);
  if (search) exportParams.set("search", search);

  const today = new Date();

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Négociations</h1>
          <p className="text-slate-500 text-sm mt-1">
            {negotiations.length} négociation{negotiations.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/negotiations/export?${exportParams.toString()}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exporter CSV
          </a>
          <Link
            href="/negotiations/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle négociation
          </Link>
        </div>
      </div>

      {/* Filters */}
      <NegotiationsFilters
        campagnes={campagnes.map((c) => c.campagne)}
        familles={familles.map((f) => f.familleAchat!)}
        currentFilters={{ statut, campagne, famille, search }}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Produit
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Campagne
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Objectif prix
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Deadline
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Éco. attendues
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Éco. réalisées
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Taux
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {negotiations.map((neg) => {
                const pmpa = neg.product.pmpa ?? 0;
                const conso = neg.product.consommationAnnuelle ?? 0;
                const objPrix =
                  neg.objectifPrix ??
                  (neg.objectifReductionPct
                    ? pmpa * (1 - neg.objectifReductionPct / 100)
                    : null);
                const ecoAttendues =
                  objPrix !== null ? (pmpa - objPrix) * conso : null;
                const ecoRealisees =
                  neg.prixFinal !== null
                    ? (pmpa - neg.prixFinal) * conso
                    : null;
                const taux =
                  ecoAttendues &&
                  ecoAttendues > 0 &&
                  ecoRealisees !== null
                    ? (ecoRealisees / ecoAttendues) * 100
                    : null;

                const deadlineDays = neg.deadline
                  ? Math.ceil(
                      (new Date(neg.deadline).getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;
                const deadlineUrgent =
                  deadlineDays !== null &&
                  deadlineDays <= 14 &&
                  neg.statut !== "CLOTURE_GAGNE" &&
                  neg.statut !== "CLOTURE_PERDU";

                return (
                  <tr
                    key={neg.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/negotiations/${neg.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {neg.product.codeProduit}
                      </Link>
                      <p className="text-slate-400 text-xs truncate max-w-[180px]">
                        {neg.product.libelle}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{neg.campagne}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {objPrix !== null ? formatCurrency(objPrix) : "—"}
                      {neg.objectifReductionPct !== null && (
                        <p className="text-xs text-slate-400">
                          -{formatNumber(neg.objectifReductionPct, 1)} %
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge statut={neg.statut} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {neg.deadline ? (
                        <div>
                          <span
                            className={`text-sm ${
                              deadlineUrgent
                                ? "text-red-600 font-semibold"
                                : "text-slate-600"
                            }`}
                          >
                            {new Date(neg.deadline).toLocaleDateString("fr-FR")}
                          </span>
                          {deadlineUrgent && deadlineDays !== null && (
                            <p className="text-xs text-red-500 font-medium">
                              {deadlineDays < 0
                                ? "En retard"
                                : `J-${deadlineDays}`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {ecoAttendues !== null
                        ? formatCurrency(ecoAttendues)
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ecoRealisees !== null ? (
                        <span
                          className={`font-semibold ${
                            ecoRealisees >= 0
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(ecoRealisees)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {taux !== null ? (
                        <span
                          className={`font-semibold ${
                            taux >= 100
                              ? "text-green-700"
                              : taux >= 75
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {formatNumber(taux, 1)} %
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/negotiations/${neg.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Voir
                        </Link>
                        <span className="text-slate-200">|</span>
                        <Link
                          href={`/negotiations/${neg.id}/edit`}
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                        >
                          Éditer
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {negotiations.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-400"
                  >
                    Aucune négociation trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

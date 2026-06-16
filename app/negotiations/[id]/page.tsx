import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import NegotiationDetailClient from "./NegotiationDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NegotiationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const negotiation = await prisma.negotiation.findUnique({
    where: { id: parseInt(id) },
    include: {
      product: {
        include: {
          equivalences: { orderBy: { prixActuel: "asc" } },
        },
      },
      steps: { orderBy: { date: "asc" } },
    },
  });

  if (!negotiation) notFound();

  const pmpa = negotiation.product.pmpa ?? 0;
  const conso = negotiation.product.consommationAnnuelle ?? 0;
  const objPrix =
    negotiation.objectifPrix ??
    (negotiation.objectifReductionPct
      ? pmpa * (1 - negotiation.objectifReductionPct / 100)
      : null);
  const ecoAttendues = objPrix !== null ? (pmpa - objPrix) * conso : null;
  const ecoRealisees =
    negotiation.prixFinal !== null
      ? (pmpa - negotiation.prixFinal) * conso
      : null;
  const taux =
    ecoAttendues && ecoAttendues > 0 && ecoRealisees !== null
      ? (ecoRealisees / ecoAttendues) * 100
      : null;

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/negotiations" className="hover:text-blue-600 transition-colors">
          Négociations
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium">
          {negotiation.product.codeProduit} — {negotiation.campagne}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href={`/products/${negotiation.product.id}`}
                className="text-xl font-bold text-blue-600 hover:underline"
              >
                {negotiation.product.codeProduit}
              </Link>
              <StatusBadge statut={negotiation.statut} />
              <span className="text-sm text-slate-500">
                Campagne {negotiation.campagne}
              </span>
            </div>
            <p className="text-slate-600 mt-1">{negotiation.product.libelle}</p>
          </div>
          <Link
            href={`/negotiations/${negotiation.id}/edit`}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modifier
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
            PMPA
          </p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {formatCurrency(negotiation.product.pmpa)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
            Objectif prix
          </p>
          <p className="text-xl font-bold text-blue-700 mt-1">
            {objPrix !== null ? formatCurrency(objPrix) : "—"}
          </p>
          {negotiation.objectifReductionPct !== null && (
            <p className="text-xs text-slate-400 mt-0.5">
              -{formatNumber(negotiation.objectifReductionPct, 1)} %
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
            Éco. attendues
          </p>
          <p className="text-xl font-bold text-slate-700 mt-1">
            {ecoAttendues !== null ? formatCurrency(ecoAttendues) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
            Éco. réalisées
          </p>
          <p
            className={`text-xl font-bold mt-1 ${
              ecoRealisees !== null
                ? ecoRealisees >= 0
                  ? "text-green-700"
                  : "text-red-600"
                : "text-slate-300"
            }`}
          >
            {ecoRealisees !== null ? formatCurrency(ecoRealisees) : "—"}
          </p>
          {taux !== null && (
            <p
              className={`text-xs mt-0.5 font-medium ${
                taux >= 100
                  ? "text-green-600"
                  : taux >= 75
                  ? "text-blue-500"
                  : "text-amber-500"
              }`}
            >
              Taux : {formatNumber(taux, 1)} %
            </p>
          )}
        </div>
      </div>

      {/* Negotiation details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Details panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">
            Paramètres
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-slate-400 uppercase font-semibold">BATNA</dt>
              <dd className="text-sm font-medium text-slate-700 mt-0.5">
                {negotiation.batna !== null ? formatCurrency(negotiation.batna) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 uppercase font-semibold">Deadline</dt>
              <dd className="text-sm font-medium text-slate-700 mt-0.5">
                {negotiation.deadline
                  ? new Date(negotiation.deadline).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 uppercase font-semibold">
                Prix final
              </dt>
              <dd className="text-sm font-bold text-slate-800 mt-0.5">
                {negotiation.prixFinal !== null
                  ? formatCurrency(negotiation.prixFinal)
                  : "—"}
              </dd>
            </div>
            {negotiation.notesConditions && (
              <div>
                <dt className="text-xs text-slate-400 uppercase font-semibold">
                  Notes & conditions
                </dt>
                <dd className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">
                  {negotiation.notesConditions}
                </dd>
              </div>
            )}
            {negotiation.prochaineAction && (
              <div>
                <dt className="text-xs text-slate-400 uppercase font-semibold">
                  Prochaine action
                </dt>
                <dd className="text-sm text-slate-700 mt-0.5 font-medium">
                  {negotiation.prochaineAction}
                </dd>
              </div>
            )}
            {negotiation.dateRelance && (
              <div>
                <dt className="text-xs text-slate-400 uppercase font-semibold">
                  Date de relance
                </dt>
                <dd className="text-sm text-slate-700 mt-0.5">
                  {new Date(negotiation.dateRelance).toLocaleDateString("fr-FR")}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Supplier prices */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Prix fournisseurs
          </h2>
          {negotiation.product.equivalences.length === 0 ? (
            <p className="text-slate-400 text-sm">Aucune équivalence renseignée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase">
                    Fabricant
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-slate-400 uppercase">
                    Réf.
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase">
                    Prix actuel
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase">
                    Prix cible
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-400 uppercase">
                    Prix obtenu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {negotiation.product.equivalences.map((e, idx) => {
                  const isLowest =
                    idx === 0 &&
                    e.prixActuel !== null &&
                    negotiation.product.equivalences.filter(
                      (x) => x.prixActuel !== null
                    ).length > 1;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-700">
                        {e.fabricant}
                      </td>
                      <td className="py-2 text-slate-500 text-xs">
                        {e.refFabricant}
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          isLowest ? "text-green-700" : "text-slate-700"
                        }`}
                      >
                        {formatCurrency(e.prixActuel)}
                      </td>
                      <td className="py-2 text-right text-slate-500">
                        {formatCurrency(e.prixCible)}
                      </td>
                      <td className="py-2 text-right text-slate-500">
                        {e.prixObtenu !== null
                          ? formatCurrency(e.prixObtenu)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Steps - client component for adding steps */}
      <NegotiationDetailClient
        negotiationId={negotiation.id}
        initialSteps={negotiation.steps as any[]}
        statut={negotiation.statut}
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency, formatNumber, statutLabel, statutColor } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";

type Negotiation = {
  id: number;
  productId: number;
  campagne: string;
  objectifPrix: number | null;
  objectifReductionPct: number | null;
  batna: number | null;
  deadline: Date | string | null;
  statut: string;
  prixFinal: number | null;
  notesConditions: string | null;
  prochaineAction: string | null;
  dateRelance: Date | string | null;
  createdAt: Date | string;
  product: {
    codeProduit: string;
    libelle: string;
    pmpa: number | null;
    consommationAnnuelle: number | null;
    familleAchat: string | null;
  };
  steps: any[];
};

interface DashboardClientProps {
  negotiations: Negotiation[];
}

const STATUT_COLORS: Record<string, string> = {
  A_LANCER: "#94a3b8",
  EN_COURS: "#3b82f6",
  CLOTURE_GAGNE: "#22c55e",
  CLOTURE_PERDU: "#ef4444",
  EN_ATTENTE: "#f59e0b",
};

export default function DashboardClient({ negotiations }: DashboardClientProps) {
  const [campagneFilter, setCampagneFilter] = useState<string>("Toutes");

  const campagnes = useMemo(() => {
    const set = new Set(negotiations.map((n) => n.campagne));
    return Array.from(set).sort();
  }, [negotiations]);

  const filtered = useMemo(() => {
    if (campagneFilter === "Toutes") return negotiations;
    return negotiations.filter((n) => n.campagne === campagneFilter);
  }, [negotiations, campagneFilter]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    let totalAttendues = 0;
    let totalRealisees = 0;
    let countWithBoth = 0;
    let sumTaux = 0;

    filtered.forEach((n) => {
      const pmpa = n.product.pmpa ?? 0;
      const conso = n.product.consommationAnnuelle ?? 0;
      const objPrix =
        n.objectifPrix ??
        (n.objectifReductionPct ? pmpa * (1 - n.objectifReductionPct / 100) : null);

      if (objPrix !== null) {
        const ecoAtt = (pmpa - objPrix) * conso;
        totalAttendues += ecoAtt;

        if (n.prixFinal !== null) {
          const ecoReal = (pmpa - n.prixFinal) * conso;
          totalRealisees += ecoReal;
          if (ecoAtt > 0) {
            sumTaux += (ecoReal / ecoAtt) * 100;
            countWithBoth++;
          }
        }
      }
    });

    return {
      totalAttendues,
      totalRealisees,
      tauxMoyen: countWithBoth > 0 ? sumTaux / countWithBoth : null,
      total: filtered.length,
    };
  }, [filtered]);

  // Chart data by statut
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      A_LANCER: 0,
      EN_COURS: 0,
      CLOTURE_GAGNE: 0,
      CLOTURE_PERDU: 0,
      EN_ATTENTE: 0,
    };
    filtered.forEach((n) => {
      counts[n.statut] = (counts[n.statut] ?? 0) + 1;
    });
    return Object.entries(counts).map(([statut, count]) => ({
      statut,
      label: statutLabel(statut),
      count,
      color: STATUT_COLORS[statut] ?? "#94a3b8",
    }));
  }, [filtered]);

  // Alerts: deadline within 30 days, not closed
  const today = new Date();
  const in30days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const alerts = useMemo(() => {
    return filtered
      .filter((n) => {
        if (!n.deadline) return false;
        if (n.statut === "CLOTURE_GAGNE" || n.statut === "CLOTURE_PERDU")
          return false;
        const dl = new Date(n.deadline);
        return dl <= in30days;
      })
      .sort((a, b) => {
        const da = new Date(a.deadline!).getTime();
        const db = new Date(b.deadline!).getTime();
        return da - db;
      });
  }, [filtered]);

  // Top 5 gains réalisés
  const topGains = useMemo(() => {
    return filtered
      .filter((n) => n.prixFinal !== null && n.product.pmpa !== null)
      .map((n) => {
        const pmpa = n.product.pmpa ?? 0;
        const conso = n.product.consommationAnnuelle ?? 0;
        const ecoReal = (pmpa - (n.prixFinal ?? 0)) * conso;
        return { ...n, ecoReal };
      })
      .filter((n) => n.ecoReal > 0)
      .sort((a, b) => b.ecoReal - a.ecoReal)
      .slice(0, 5);
  }, [filtered]);

  const daysUntil = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">
            Vue d&apos;ensemble des négociations achats
          </p>
        </div>

        {/* Campagne filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium">Campagne :</label>
          <div className="flex gap-1">
            {["Toutes", ...campagnes].map((c) => (
              <button
                key={c}
                onClick={() => setCampagneFilter(c)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  campagneFilter === c
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Total négociations
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Économies visées
          </p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {formatCurrency(kpis.totalAttendues)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Économies réalisées
          </p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {formatCurrency(kpis.totalRealisees)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Taux d&apos;atteinte moyen
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {kpis.tauxMoyen !== null ? `${formatNumber(kpis.tauxMoyen, 1)} %` : "—"}
          </p>
        </div>
      </div>

      {/* Chart + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart by statut */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Négociations par statut
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="count" name="Négociations" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Alertes délais (&lt; 30 jours)
          </h2>
          {alerts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              Aucune alerte deadline
            </p>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-52">
              {alerts.map((n) => {
                const days = daysUntil(n.deadline);
                const isUrgent = days !== null && days <= 7;
                return (
                  <Link
                    key={n.id}
                    href={`/negotiations/${n.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {n.product.codeProduit} — {n.product.libelle.slice(0, 40)}
                        {n.product.libelle.length > 40 ? "…" : ""}
                      </p>
                      <StatusBadge statut={n.statut} className="mt-1" />
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <span
                        className={`text-sm font-bold ${
                          isUrgent ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {days !== null && days < 0
                          ? "En retard"
                          : `J-${days}`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top 5 gains */}
      {topGains.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            Top 5 — Gains réalisés
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">
                    Produit
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">
                    Campagne
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase">
                    PMPA
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase">
                    Prix final
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 uppercase">
                    Économies réalisées
                  </th>
                </tr>
              </thead>
              <tbody>
                {topGains.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/negotiations/${n.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {n.product.codeProduit}
                      </Link>
                      <p className="text-slate-400 text-xs truncate max-w-[200px]">
                        {n.product.libelle}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{n.campagne}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatCurrency(n.product.pmpa)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatCurrency(n.prixFinal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-green-700">
                      {formatCurrency(n.ecoReal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

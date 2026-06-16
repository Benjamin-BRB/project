"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUTS = [
  { value: "", label: "Tous" },
  { value: "A_LANCER", label: "À lancer" },
  { value: "EN_COURS", label: "En cours" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "CLOTURE_GAGNE", label: "Clôturé - Gagné" },
  { value: "CLOTURE_PERDU", label: "Clôturé - Perdu" },
];

interface NegotiationsFiltersProps {
  campagnes: string[];
  familles: string[];
  currentFilters: {
    statut: string;
    campagne: string;
    famille: string;
    search: string;
  };
}

export default function NegotiationsFilters({
  campagnes,
  familles,
  currentFilters,
}: NegotiationsFiltersProps) {
  const router = useRouter();
  const [statut, setStatut] = useState(currentFilters.statut);
  const [campagne, setCampagne] = useState(currentFilters.campagne);
  const [famille, setFamille] = useState(currentFilters.famille);
  const [search, setSearch] = useState(currentFilters.search);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (statut) params.set("statut", statut);
    if (campagne) params.set("campagne", campagne);
    if (famille) params.set("famille", famille);
    if (search) params.set("search", search);
    router.push(`/negotiations?${params.toString()}`);
  };

  const resetFilters = () => {
    setStatut("");
    setCampagne("");
    setFamille("");
    setSearch("");
    router.push("/negotiations");
  };

  const hasFilters = statut || campagne || famille || search;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Recherche
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Code ou libellé produit..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Statut
          </label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Campagne
          </label>
          <select
            value={campagne}
            onChange={(e) => setCampagne(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Toutes</option>
            {campagnes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Famille achat
          </label>
          <select
            value={famille}
            onChange={(e) => setFamille(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Toutes</option>
            {familles.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Filtrer
          </button>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

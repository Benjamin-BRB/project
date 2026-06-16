"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductsFiltersProps {
  familles: string[];
  acheteurs: string[];
  currentFilters: {
    search: string;
    famille: string;
    acheteur: string;
    sommeil: string;
    norme: string;
  };
}

export default function ProductsFilters({
  familles,
  acheteurs,
  currentFilters,
}: ProductsFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search);
  const [famille, setFamille] = useState(currentFilters.famille);
  const [acheteur, setAcheteur] = useState(currentFilters.acheteur);
  const [sommeil, setSommeil] = useState(currentFilters.sommeil);
  const [norme, setNorme] = useState(currentFilters.norme);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (famille) params.set("famille", famille);
    if (acheteur) params.set("acheteur", acheteur);
    if (sommeil) params.set("sommeil", sommeil);
    if (norme) params.set("norme", norme);
    router.push(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setFamille("");
    setAcheteur("");
    setSommeil("");
    setNorme("");
    router.push("/products");
  };

  const hasFilters = search || famille || acheteur || sommeil || norme;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Recherche
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Code ou libellé..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Acheteur
          </label>
          <select
            value={acheteur}
            onChange={(e) => setAcheteur(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Tous</option>
            {acheteurs.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Sommeil
          </label>
          <select
            value={sommeil}
            onChange={(e) => setSommeil(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Tous</option>
            <option value="N">Actifs</option>
            <option value="O">En sommeil</option>
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Norme
          </label>
          <input
            type="text"
            value={norme}
            onChange={(e) => setNorme(e.target.value)}
            placeholder="DIN, ISO..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

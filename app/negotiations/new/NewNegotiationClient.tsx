"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Product {
  id: number;
  codeProduit: string;
  libelle: string;
  pmpa: number | null;
  consommationAnnuelle: number | null;
  familleAchat: string | null;
}

interface NewNegotiationClientProps {
  products: Product[];
  preselectedProduct: Product | null;
}

export default function NewNegotiationClient({
  products,
  preselectedProduct,
}: NewNegotiationClientProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    preselectedProduct
  );
  const [productSearch, setProductSearch] = useState(
    preselectedProduct ? preselectedProduct.codeProduit : ""
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [campagne, setCampagne] = useState("2026");
  const [objectifPrix, setObjectifPrix] = useState("");
  const [objectifReductionPct, setObjectifReductionPct] = useState("");
  const [batna, setBatna] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtered products for autocomplete
  const filteredProducts = useMemo(() => {
    if (productSearch.length < 2) return [];
    const q = productSearch.toLowerCase();
    return products
      .filter(
        (p) =>
          p.codeProduit.toLowerCase().includes(q) ||
          p.libelle.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [products, productSearch]);

  // Mutual calculation between objectifPrix and objectifReductionPct
  const handleObjectifPrixChange = (val: string) => {
    setObjectifPrix(val);
    if (val && selectedProduct?.pmpa) {
      const prix = parseFloat(val);
      if (!isNaN(prix) && selectedProduct.pmpa > 0) {
        const pct = ((selectedProduct.pmpa - prix) / selectedProduct.pmpa) * 100;
        setObjectifReductionPct(pct.toFixed(2));
      }
    }
  };

  const handleObjectifReductionChange = (val: string) => {
    setObjectifReductionPct(val);
    if (val && selectedProduct?.pmpa) {
      const pct = parseFloat(val);
      if (!isNaN(pct)) {
        const prix = selectedProduct.pmpa * (1 - pct / 100);
        setObjectifPrix(prix.toFixed(4));
      }
    }
  };

  // Calculate économies attendues
  const ecoAttendues = useMemo(() => {
    if (!selectedProduct?.pmpa || !selectedProduct?.consommationAnnuelle)
      return null;
    const prix = objectifPrix ? parseFloat(objectifPrix) : null;
    if (prix === null || isNaN(prix)) return null;
    return (selectedProduct.pmpa - prix) * selectedProduct.consommationAnnuelle;
  }, [selectedProduct, objectifPrix]);

  const selectProduct = (p: Product) => {
    setSelectedProduct(p);
    setProductSearch(p.codeProduit);
    setShowDropdown(false);
    // Reset calculations
    setObjectifPrix("");
    setObjectifReductionPct("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError("Veuillez sélectionner un produit");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          campagne,
          objectifPrix: objectifPrix || null,
          objectifReductionPct: objectifReductionPct || null,
          batna: batna || null,
          deadline: deadline || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la création");
      }

      const neg = await res.json();
      router.push(`/negotiations/${neg.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Product selection */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">Produit</h2>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rechercher un produit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setSelectedProduct(null);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Tapez un code ou libellé..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {showDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProduct(p)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <p className="text-sm font-medium text-slate-700">
                    {p.codeProduit}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{p.libelle}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected product info */}
        {selectedProduct && (
          <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">PMPA</p>
              <p className="text-slate-800 font-bold mt-0.5">
                {formatCurrency(selectedProduct.pmpa)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">
                Conso. annuelle
              </p>
              <p className="text-slate-700 font-medium mt-0.5">
                {selectedProduct.consommationAnnuelle !== null
                  ? formatNumber(selectedProduct.consommationAnnuelle, 0)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">
                Famille
              </p>
              <p className="text-slate-700 font-medium mt-0.5">
                {selectedProduct.familleAchat ?? "—"}
              </p>
            </div>
            <div className="col-span-3">
              <p className="text-xs text-slate-500 truncate">{selectedProduct.libelle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Negotiation parameters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">
          Paramètres de la négociation
        </h2>

        {/* Campagne */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Campagne <span className="text-red-500">*</span>
          </label>
          <select
            value={campagne}
            onChange={(e) => setCampagne(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        {/* Objectif prix / réduction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Objectif prix (€)
            </label>
            <input
              type="number"
              step="0.0001"
              value={objectifPrix}
              onChange={(e) => handleObjectifPrixChange(e.target.value)}
              placeholder="0.0000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Objectif réduction (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={objectifReductionPct}
              onChange={(e) => handleObjectifReductionChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Real-time calculation */}
        {ecoAttendues !== null && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium border ${
              ecoAttendues > 0
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            Économies attendues : {formatCurrency(ecoAttendues)}/an
          </div>
        )}

        {/* BATNA */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            BATNA — prix de repli (€)
          </label>
          <input
            type="number"
            step="0.0001"
            value={batna}
            onChange={(e) => setBatna(e.target.value)}
            placeholder="Prix maximum acceptable"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !selectedProduct}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Création..." : "Créer la négociation"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

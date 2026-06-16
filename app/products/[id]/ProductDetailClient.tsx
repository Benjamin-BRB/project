"use client";

import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Modal from "@/components/Modal";

interface Equivalence {
  id: number;
  productId: number;
  refFabricant: string;
  fabricant: string;
  equivalenceCode: string | null;
  famille: string | null;
  qteReappro: number | null;
  poids: number | null;
  uniteAchat: string | null;
  uniteStock: string | null;
  sommeil: string | null;
  prixActuel: number | null;
  prixCible: number | null;
  prixObtenu: number | null;
  dateMAJPrix: string | null;
  isPreferred: boolean;
}

interface Product {
  id: number;
  preferredMode: string;
  equivalences: Equivalence[];
}

interface ProductDetailClientProps {
  product: Product;
  activeNegotiationId?: number;
}

export default function ProductDetailClient({
  product,
  activeNegotiationId,
}: ProductDetailClientProps) {
  const [equivalences, setEquivalences] = useState<Equivalence[]>(
    product.equivalences
  );
  const [preferredMode, setPreferredMode] = useState(product.preferredMode);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    equiv: Equivalence | null;
  }>({ open: false, equiv: null });
  const [editForm, setEditForm] = useState({
    prixActuel: "",
    prixCible: "",
    prixObtenu: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEdit = (equiv: Equivalence) => {
    setEditForm({
      prixActuel: equiv.prixActuel?.toString() ?? "",
      prixCible: equiv.prixCible?.toString() ?? "",
      prixObtenu: equiv.prixObtenu?.toString() ?? "",
    });
    setEditModal({ open: true, equiv });
  };

  const saveEdit = async () => {
    if (!editModal.equiv) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/equivalences/${editModal.equiv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prixActuel: editForm.prixActuel ? parseFloat(editForm.prixActuel) : null,
          prixCible: editForm.prixCible ? parseFloat(editForm.prixCible) : null,
          prixObtenu: editForm.prixObtenu ? parseFloat(editForm.prixObtenu) : null,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      const updated = await res.json();
      setEquivalences((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      setEditModal({ open: false, equiv: null });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setPreferred = async (equiv: Equivalence) => {
    try {
      const res = await fetch(`/api/equivalences/${equiv.id}/preferred`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erreur");
      setEquivalences((prev) =>
        prev.map((e) => ({ ...e, isPreferred: e.id === equiv.id }))
      );
      setPreferredMode("manual");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const resetToAuto = async () => {
    try {
      const res = await fetch(`/api/products/${product.id}/preferred-mode`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erreur");
      setPreferredMode("auto");
      setEquivalences((prev) => prev.map((e) => ({ ...e, isPreferred: false })));
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  // Determine best (lowest) price
  const withPrice = equivalences.filter(
    (e) => e.prixActuel !== null && e.prixActuel !== undefined
  );
  const bestPrix =
    withPrice.length > 0
      ? Math.min(...withPrice.map((e) => e.prixActuel!))
      : null;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-700">
              Équivalences fournisseurs
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                preferredMode === "auto"
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              Mode : {preferredMode === "auto" ? "Automatique" : "Manuel"}
            </span>
          </div>
          {preferredMode === "manual" && (
            <button
              onClick={resetToAuto}
              className="text-sm text-slate-500 hover:text-blue-600 underline transition-colors"
            >
              Revenir en automatique
            </button>
          )}
        </div>

        {equivalences.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center">
            Aucune équivalence renseignée
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Réf. Fabricant
                  </th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Fabricant
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Prix actuel
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Prix cible
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Prix obtenu
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Qté réappro
                  </th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Préférée
                  </th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equivalences.map((equiv) => {
                  const isBest =
                    bestPrix !== null && equiv.prixActuel === bestPrix;
                  const isPreferred =
                    preferredMode === "manual"
                      ? equiv.isPreferred
                      : isBest;

                  return (
                    <tr
                      key={equiv.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isPreferred ? "bg-green-50/50" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {equiv.refFabricant}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {equiv.fabricant}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-semibold ${
                          isBest ? "text-green-700" : "text-slate-700"
                        }`}
                      >
                        {isBest && (
                          <span className="mr-1 text-xs">★</span>
                        )}
                        {formatCurrency(equiv.prixActuel)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {formatCurrency(equiv.prixCible)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {equiv.prixObtenu !== null
                          ? formatCurrency(equiv.prixObtenu)
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {equiv.qteReappro !== null
                          ? formatNumber(equiv.qteReappro, 0)
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setPreferred(equiv)}
                          title={
                            isPreferred
                              ? "Fournisseur préféré"
                              : "Définir comme préféré"
                          }
                          className={`transition-colors ${
                            isPreferred
                              ? "text-amber-500"
                              : "text-slate-300 hover:text-amber-400"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill={isPreferred ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => openEdit(equiv)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        >
                          Modifier prix
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit prix modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, equiv: null })}
        title={`Modifier les prix — ${editModal.equiv?.fabricant ?? ""}`}
        size="sm"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prix actuel (€)
            </label>
            <input
              type="number"
              step="0.0001"
              value={editForm.prixActuel}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, prixActuel: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prix cible (€)
            </label>
            <input
              type="number"
              step="0.0001"
              value={editForm.prixCible}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, prixCible: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prix obtenu (€)
            </label>
            <input
              type="number"
              step="0.0001"
              value={editForm.prixObtenu}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, prixObtenu: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0000"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setEditModal({ open: false, equiv: null })}
              className="flex-1 px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

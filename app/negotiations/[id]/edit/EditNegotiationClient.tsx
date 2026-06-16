"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils";

const STATUTS = [
  { value: "A_LANCER", label: "À lancer" },
  { value: "EN_COURS", label: "En cours" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "CLOTURE_GAGNE", label: "Clôturé - Gagné" },
  { value: "CLOTURE_PERDU", label: "Clôturé - Perdu" },
];

interface Negotiation {
  id: number;
  campagne: string;
  objectifPrix: number | null;
  objectifReductionPct: number | null;
  batna: number | null;
  deadline: string | null;
  statut: string;
  prixFinal: number | null;
  notesConditions: string | null;
  prochaineAction: string | null;
  dateRelance: string | null;
  product: {
    id: number;
    codeProduit: string;
    pmpa: number | null;
    consommationAnnuelle: number | null;
  };
}

interface NegotiationEditClientProps {
  negotiation: Negotiation;
}

export default function EditNegotiationClient({
  negotiation,
}: NegotiationEditClientProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    campagne: negotiation.campagne,
    objectifPrix: negotiation.objectifPrix?.toString() ?? "",
    objectifReductionPct: negotiation.objectifReductionPct?.toString() ?? "",
    batna: negotiation.batna?.toString() ?? "",
    deadline: negotiation.deadline
      ? new Date(negotiation.deadline).toISOString().split("T")[0]
      : "",
    statut: negotiation.statut,
    prixFinal: negotiation.prixFinal?.toString() ?? "",
    notesConditions: negotiation.notesConditions ?? "",
    prochaineAction: negotiation.prochaineAction ?? "",
    dateRelance: negotiation.dateRelance
      ? new Date(negotiation.dateRelance).toISOString().split("T")[0]
      : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pmpa = negotiation.product.pmpa ?? 0;
  const conso = negotiation.product.consommationAnnuelle ?? 0;

  const handleObjectifPrixChange = (val: string) => {
    setForm((f) => ({ ...f, objectifPrix: val }));
    if (val && pmpa > 0) {
      const prix = parseFloat(val);
      if (!isNaN(prix)) {
        const pct = ((pmpa - prix) / pmpa) * 100;
        setForm((f) => ({
          ...f,
          objectifPrix: val,
          objectifReductionPct: pct.toFixed(2),
        }));
      }
    }
  };

  const handleObjectifReductionChange = (val: string) => {
    if (val && pmpa > 0) {
      const pct = parseFloat(val);
      if (!isNaN(pct)) {
        const prix = pmpa * (1 - pct / 100);
        setForm((f) => ({
          ...f,
          objectifReductionPct: val,
          objectifPrix: prix.toFixed(4),
        }));
        return;
      }
    }
    setForm((f) => ({ ...f, objectifReductionPct: val }));
  };

  const ecoAttendues = (() => {
    const prix = form.objectifPrix ? parseFloat(form.objectifPrix) : null;
    if (prix === null || isNaN(prix) || !pmpa || !conso) return null;
    return (pmpa - prix) * conso;
  })();

  const ecoRealisees = (() => {
    const pf = form.prixFinal ? parseFloat(form.prixFinal) : null;
    if (pf === null || isNaN(pf) || !pmpa || !conso) return null;
    return (pmpa - pf) * conso;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/negotiations/${negotiation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campagne: form.campagne,
          objectifPrix: form.objectifPrix || null,
          objectifReductionPct: form.objectifReductionPct || null,
          batna: form.batna || null,
          deadline: form.deadline || null,
          statut: form.statut,
          prixFinal: form.prixFinal || null,
          notesConditions: form.notesConditions || null,
          prochaineAction: form.prochaineAction || null,
          dateRelance: form.dateRelance || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la mise à jour");
      }

      router.push(`/negotiations/${negotiation.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Product info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-3">
          Produit lié
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">PMPA</p>
            <p className="font-bold text-slate-800">{formatCurrency(pmpa)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Conso. annuelle</p>
            <p className="font-medium text-slate-700">
              {conso ? formatNumber(conso, 0) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Code produit</p>
            <p className="font-medium text-slate-700">
              {negotiation.product.codeProduit}
            </p>
          </div>
        </div>
      </div>

      {/* Main parameters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">Paramètres</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Campagne <span className="text-red-500">*</span>
            </label>
            <select
              value={form.campagne}
              onChange={(e) => setForm((f) => ({ ...f, campagne: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              value={form.statut}
              onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Objectif prix (€)
            </label>
            <input
              type="number"
              step="0.0001"
              value={form.objectifPrix}
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
              value={form.objectifReductionPct}
              onChange={(e) => handleObjectifReductionChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {ecoAttendues !== null && (
          <div
            className={`rounded-lg px-4 py-2 text-sm font-medium border ${
              ecoAttendues > 0
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            Économies attendues : {formatCurrency(ecoAttendues)} / an
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              BATNA (€)
            </label>
            <input
              type="number"
              step="0.0001"
              value={form.batna}
              onChange={(e) => setForm((f) => ({ ...f, batna: e.target.value }))}
              placeholder="Prix maximum acceptable"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, deadline: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">
          Résultat de la négociation
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prix final obtenu (€)
          </label>
          <input
            type="number"
            step="0.0001"
            value={form.prixFinal}
            onChange={(e) =>
              setForm((f) => ({ ...f, prixFinal: e.target.value }))
            }
            placeholder="Prix négocié et accepté"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {ecoRealisees !== null && (
            <p
              className={`mt-1.5 text-sm font-medium ${
                ecoRealisees >= 0 ? "text-green-700" : "text-red-600"
              }`}
            >
              Économies réalisées : {formatCurrency(ecoRealisees)} / an
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes & conditions
          </label>
          <textarea
            value={form.notesConditions}
            onChange={(e) =>
              setForm((f) => ({ ...f, notesConditions: e.target.value }))
            }
            rows={4}
            placeholder="Conditions particulières, modalités, durée de validité..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Next action */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-slate-700">
          Suivi &amp; Relance
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prochaine action
          </label>
          <input
            type="text"
            value={form.prochaineAction}
            onChange={(e) =>
              setForm((f) => ({ ...f, prochaineAction: e.target.value }))
            }
            placeholder="Que faire ensuite ?"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date de relance
          </label>
          <input
            type="date"
            value={form.dateRelance}
            onChange={(e) =>
              setForm((f) => ({ ...f, dateRelance: e.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/negotiations/${negotiation.id}`)}
          className="px-4 py-2.5 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

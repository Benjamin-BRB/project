"use client";

import { useState } from "react";

interface NegotiationStep {
  id: number;
  negotiationId: number;
  date: string;
  action: string;
  note: string | null;
}

interface NegotiationDetailClientProps {
  negotiationId: number;
  initialSteps: NegotiationStep[];
  statut: string;
}

export default function NegotiationDetailClient({
  negotiationId,
  initialSteps,
  statut,
}: NegotiationDetailClientProps) {
  const [steps, setSteps] = useState<NegotiationStep[]>(initialSteps);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    action: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClosed =
    statut === "CLOTURE_GAGNE" || statut === "CLOTURE_PERDU";

  const addStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.action.trim()) {
      setError("L'action est obligatoire");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/negotiations/${negotiationId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }

      const step = await res.json();
      setSteps((prev) => [...prev, step].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      setFormData({
        date: new Date().toISOString().split("T")[0],
        action: "",
        note: "",
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-700">
          Historique des étapes
          {steps.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {steps.length}
            </span>
          )}
        </h2>
        {!isClosed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une étape
          </button>
        )}
      </div>

      {/* Add step form */}
      {showForm && (
        <form onSubmit={addStep} className="mb-6 bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Nouvelle étape</h3>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Action <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.action}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, action: e.target.value }))
                }
                placeholder="Ex: Appel téléphonique..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Note / détails
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((f) => ({ ...f, note: e.target.value }))
              }
              rows={3}
              placeholder="Résultat, points clés, éléments à retenir..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Steps timeline */}
      {steps.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">
          Aucune étape enregistrée
        </p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="relative flex gap-4 pl-7">
                {/* Dot */}
                <div
                  className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    idx === steps.length - 1
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline gap-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {step.action}
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(step.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {step.note && (
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

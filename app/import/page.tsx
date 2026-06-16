"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { extractNorme } from "@/lib/utils";

type ImportSummary = {
  created?: number;
  updated?: number;
  linked?: number;
  unmatched?: number;
  errors: string[];
};

export default function ImportPage() {
  const [productFile, setProductFile] = useState<File | null>(null);
  const [equivFile, setEquivFile] = useState<File | null>(null);
  const [productSummary, setProductSummary] = useState<ImportSummary | null>(null);
  const [equivSummary, setEquivSummary] = useState<ImportSummary | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [equivLoading, setEquivLoading] = useState(false);
  const productRef = useRef<HTMLInputElement>(null);
  const equivRef = useRef<HTMLInputElement>(null);

  async function handleProductImport() {
    if (!productFile) return;
    setProductLoading(true);
    setProductSummary(null);
    try {
      const buffer = await productFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const products = rows.map((row) => {
        const libelle =
          String(row["Libellé"] ?? row["Libelle"] ?? row["libelle"] ?? "");
        return {
          codeProduit:
            String(row["Code article"] ?? row["id_prd"] ?? row["Code_article"] ?? "").trim(),
          libelle,
          norme: extractNorme(libelle),
          sommeil: row["Sommeil"] != null ? String(row["Sommeil"]) : null,
          acheteur: row["Acheteur"] != null ? String(row["Acheteur"]) : null,
          familleAchat:
            row["Famille Achat"] != null ? String(row["Famille Achat"]) : null,
          stock: row["Stock"] != null ? Number(row["Stock"]) : null,
          valeurStock:
            row["valeur_stock"] != null ? Number(row["valeur_stock"]) : null,
          consommationAnnuelle:
            row["Consommation annuelle"] != null
              ? Number(row["Consommation annuelle"])
              : null,
          pmpa: row["PMPA"] != null ? Number(row["PMPA"]) : null,
          miniCommande:
            row["Mini de commande"] != null
              ? Number(row["Mini de commande"])
              : null,
          qteReappro:
            row["Qte_Reap"] != null ? Number(row["Qte_Reap"]) : null,
          delaiReappro:
            row["Délai de réappro"] != null
              ? String(row["Délai de réappro"])
              : null,
        };
      }).filter((p) => p.codeProduit);

      const res = await fetch("/api/import/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      setProductSummary(data);
    } catch (err: any) {
      setProductSummary({ errors: [err.message] });
    } finally {
      setProductLoading(false);
    }
  }

  async function handleEquivImport() {
    if (!equivFile) return;
    setEquivLoading(true);
    setEquivSummary(null);
    try {
      const buffer = await equivFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      const equivalences = rows.map((row) => ({
        codeProduit:
          String(row["Produit"] ?? row["Code article"] ?? "").trim(),
        refFabricant: String(row["Ref Fabricant"] ?? "").trim(),
        fabricant: String(row["Fabricant"] ?? "").trim(),
        equivalenceCode:
          row["Equivalence"] != null ? String(row["Equivalence"]) : null,
        famille: row["Famille"] != null ? String(row["Famille"]) : null,
        qteReappro:
          row["Qte Reappro"] != null ? Number(row["Qte Reappro"]) : null,
        poids: row["Poids"] != null ? Number(row["Poids"]) : null,
        uniteAchat:
          row["Unite Achat"] != null ? String(row["Unite Achat"]) : null,
        uniteStock:
          row["Unité Stock"] != null
            ? String(row["Unité Stock"])
            : row["Unite Stock"] != null
            ? String(row["Unite Stock"])
            : null,
        sommeil: row["Sommeil"] != null ? String(row["Sommeil"]) : null,
      })).filter((e) => e.codeProduit && e.refFabricant && e.fabricant);

      const res = await fetch("/api/import/equivalences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equivalences }),
      });
      const data = await res.json();
      setEquivSummary(data);
    } catch (err: any) {
      setEquivSummary({ errors: [err.message] });
    } finally {
      setEquivLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Import de données</h1>
        <p className="text-slate-500 text-sm mt-1">
          Importez vos fichiers Excel pour alimenter la base de données
        </p>
      </div>

      {/* Products import */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Import produits</h2>
            <p className="text-xs text-slate-500">
              Colonnes attendues : Code article, Libellé, Sommeil, Acheteur, Famille Achat, Stock, valeur_stock, Consommation annuelle, PMPA, Mini de commande, Qte_Reap, Délai de réappro
            </p>
          </div>
        </div>

        <div
          className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          onClick={() => productRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) setProductFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={productRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
          />
          {productFile ? (
            <div>
              <p className="text-blue-600 font-medium">{productFile.name}</p>
              <p className="text-slate-400 text-sm mt-1">
                {(productFile.size / 1024).toFixed(1)} Ko
              </p>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-slate-500 text-sm">Glissez un fichier .xlsx ou cliquez pour parcourir</p>
            </div>
          )}
        </div>

        <button
          onClick={handleProductImport}
          disabled={!productFile || productLoading}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {productLoading ? "Import en cours..." : "Lancer l'import produits"}
        </button>

        {productSummary && (
          <div className={`rounded-lg p-4 text-sm ${productSummary.errors.length > 0 && !productSummary.created && !productSummary.updated ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
            <p className="font-medium text-slate-800 mb-2">Résumé de l'import</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center bg-white rounded p-2">
                <p className="text-2xl font-bold text-green-600">{productSummary.created ?? 0}</p>
                <p className="text-xs text-slate-500">Créés</p>
              </div>
              <div className="text-center bg-white rounded p-2">
                <p className="text-2xl font-bold text-blue-600">{productSummary.updated ?? 0}</p>
                <p className="text-xs text-slate-500">Mis à jour</p>
              </div>
              <div className="text-center bg-white rounded p-2">
                <p className="text-2xl font-bold text-red-600">{productSummary.errors.length}</p>
                <p className="text-xs text-slate-500">Erreurs</p>
              </div>
            </div>
            {productSummary.errors.length > 0 && (
              <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                {productSummary.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
                {productSummary.errors.length > 10 && (
                  <li>... et {productSummary.errors.length - 10} autres erreurs</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Equivalences import */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Import équivalences</h2>
            <p className="text-xs text-slate-500">
              Colonnes attendues : Produit (code), Ref Fabricant, Fabricant, Equivalence, Famille, Qte Reappro, Poids, Unite Achat, Unité Stock, Sommeil
            </p>
          </div>
        </div>

        <div
          className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
          onClick={() => equivRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) setEquivFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={equivRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setEquivFile(e.target.files?.[0] ?? null)}
          />
          {equivFile ? (
            <div>
              <p className="text-emerald-600 font-medium">{equivFile.name}</p>
              <p className="text-slate-400 text-sm mt-1">
                {(equivFile.size / 1024).toFixed(1)} Ko
              </p>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-slate-500 text-sm">Glissez un fichier .xlsx ou cliquez pour parcourir</p>
            </div>
          )}
        </div>

        <button
          onClick={handleEquivImport}
          disabled={!equivFile || equivLoading}
          className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {equivLoading ? "Import en cours..." : "Lancer l'import équivalences"}
        </button>

        {equivSummary && (
          <div className={`rounded-lg p-4 text-sm ${equivSummary.errors.length > 0 && !equivSummary.linked ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
            <p className="font-medium text-slate-800 mb-2">Résumé de l'import</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center bg-white rounded p-2">
                <p className="text-2xl font-bold text-green-600">{equivSummary.linked ?? 0}</p>
                <p className="text-xs text-slate-500">Liées</p>
              </div>
              <div className="text-center bg-white rounded p-2">
                <p className="text-2xl font-bold text-amber-600">{equivSummary.unmatched ?? 0}</p>
                <p className="text-xs text-slate-500">Non matchées</p>
              </div>
              <div className="text-center bg-white rounded p-2">
                <p className="text-2xl font-bold text-red-600">{equivSummary.errors.length}</p>
                <p className="text-xs text-slate-500">Erreurs</p>
              </div>
            </div>
            {equivSummary.errors.length > 0 && (
              <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                {equivSummary.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
                {equivSummary.errors.length > 10 && (
                  <li>... et {equivSummary.errors.length - 10} autres erreurs</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

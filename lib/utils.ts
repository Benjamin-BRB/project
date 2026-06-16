export function extractNorme(libelle: string): string | null {
  // Match NFE, NFEN, NF EN, DIN, ISO followed by numeric code (with optional dashes)
  const pattern = /\b(NFE|NFEN|NF\s*EN|DIN|ISO)\s*(\d[\d\-]*)/i;
  const match = libelle.match(pattern);
  if (!match) return null;

  let prefix = match[1].toUpperCase().replace(/\s+/g, "");
  // Normalize NF EN → NFEN
  if (prefix === "NFEN") prefix = "NFEN";
  const code = match[2];
  return `${prefix}${code}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getPreferredEquivalence(
  equivalences: any[],
  preferredMode: string
): any | null {
  if (!equivalences || equivalences.length === 0) return null;

  if (preferredMode === "manual") {
    return equivalences.find((e) => e.isPreferred) ?? null;
  }

  // auto: return the one with lowest prixActuel (if set)
  const withPrice = equivalences.filter(
    (e) => e.prixActuel !== null && e.prixActuel !== undefined
  );
  if (withPrice.length === 0) return null;
  return withPrice.reduce((best, e) =>
    e.prixActuel < best.prixActuel ? e : best
  );
}

export function statutLabel(statut: string): string {
  const labels: Record<string, string> = {
    A_LANCER: "À lancer",
    EN_COURS: "En cours",
    CLOTURE_GAGNE: "Clôturé - Gagné",
    CLOTURE_PERDU: "Clôturé - Perdu",
    EN_ATTENTE: "En attente",
  };
  return labels[statut] ?? statut;
}

export function statutColor(statut: string): string {
  const colors: Record<string, string> = {
    A_LANCER: "bg-slate-100 text-slate-700",
    EN_COURS: "bg-blue-100 text-blue-700",
    CLOTURE_GAGNE: "bg-green-100 text-green-700",
    CLOTURE_PERDU: "bg-red-100 text-red-700",
    EN_ATTENTE: "bg-amber-100 text-amber-700",
  };
  return colors[statut] ?? "bg-gray-100 text-gray-700";
}

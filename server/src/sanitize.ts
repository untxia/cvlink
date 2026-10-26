/**
 * Nettoyage des CV avant tout envoi à l'IA ou au destinataire.
 *
 * Règles (voir docs/AGENT_IA.md et docs/RGPD.md) :
 *  - prénom seul, jamais de nom de famille ;
 *  - ni téléphone, ni e-mail, ni adresse, ni date de naissance ;
 *  - pas de nom d'employeur (on garde les postes et les missions) ;
 *  - aucune information sans rapport avec le poste (nationalité, situation familiale…).
 *
 * Le nettoyage est fait par le CODE, pas par l'IA. Il est volontairement prudent :
 * en cas de doute, on retire. Un second passage (`findResidualPii`) sert de contrôle.
 */

export type PiiCategory =
  | "email"
  | "telephone"
  | "url"
  | "adresse"
  | "code_postal"
  | "naissance"
  | "ligne_sensible"
  | "nom_famille"
  | "employeur"
  | "lieu"
  | "caracteres_caches";

export interface SanitizeOptions {
  /** Noms de famille connus du candidat (issus de la fiche source), à retirer du texte. */
  familyNames?: readonly string[];
  /** Employeurs connus (issus de la fiche source), à remplacer. */
  employers?: readonly string[];
  /** Villes et lieux connus (domicile, lieux de mission, écoles), à remplacer. */
  places?: readonly string[];
}

export interface SanitizeResult {
  text: string;
  /** Nombre d'éléments retirés, par catégorie. */
  removed: Partial<Record<PiiCategory, number>>;
  /** Signalements de sécurité (texte caché, tentative d'instruction) à montrer au recruteur. */
  alerts: string[];
}

export const EMPLOYER_PLACEHOLDER = "[employeur]";
export const PLACE_PLACEHOLDER = "[lieu]";
const REMOVED = "";

// --- Motifs ---------------------------------------------------------------

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// 06 12 34 56 78 · 06.12.34.56.78 · 0612345678 · +33 6 12 34 56 78 · 0033 6 …
const PHONE = /(?:(?:\+|00)\s?33[\s.-]?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/g;
const URL_LIKE =
  /\b(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)?(?:linkedin|github|facebook|instagram|twitter|x)\.com\/\S*/gi;
const STREET_TYPES =
  "rue|avenue|av\\.?|boulevard|bd|chemin|impasse|all[ée]e|place|route|quai|cours|square|lotissement|r[ée]sidence|hameau|passage|sentier";
// 12 rue des Lilas · 3 bis avenue Foch · 45, chemin de la Plaine
const ADDRESS = new RegExp(
  `\\b\\d{1,4}\\s?(?:bis|ter)?\\s*,?\\s+(?:${STREET_TYPES})(?![\\p{L}])[^\\n,;|·]*`,
  "giu",
);
// 64000 Pau · 64 000 Pau
const POSTAL = /\b\d{2}\s?\d{3}\s+[A-ZÉÈÀÂÎÔÛ][\p{L}'’-]+(?:[ -][A-ZÉÈÀÂÎÔÛ][\p{L}'’-]+)*/gu;
const BIRTH = /(?:\bn[ée]e?\s+le\b|\bdate\s+de\s+naissance\b|\bn[ée]e?\s+en\b)\s*:?\s*[^\n]{0,30}/giu;
// Attention : \b de JavaScript ne reconnaît pas les lettres accentuées (« Âgé », « Nationalité »).
// On utilise donc des bornes explicites basées sur \p{L}.
const AGE = /(?<![\p{L}])[aâ]g[ée]e?\s*(?:de\s*)?:?\s*\d{2}\s*ans(?![\p{L}])/giu;
const SENSITIVE_LINE =
  /^[ \t]*(?:nationalit[ée]|situation\s+familiale|situation\s+de\s+famille|mari[ée]e?|c[ée]libataire|pacs[ée]e?|divorc[ée]e?|veuf|veuve|enfants?\s*:|nombre\s+d['’]enfants|religion|sant[ée]\s*:|handicap|photo)(?![\p{L}]).*$/gimu;

// Caractères invisibles couramment utilisés pour cacher du texte ou casser les filtres.
const INVISIBLE = /[​-‏‪-‮⁠-⁤﻿]/g;
// Tentatives d'instruction cachées dans un CV (le texte d'un CV est une donnée, jamais une consigne).
const INJECTION =
  /(?:ignore[zr]?\s+(?:toutes?\s+)?(?:les\s+)?(?:instructions?|consignes?)|oublie[zr]?\s+(?:toutes?\s+)?(?:les\s+)?(?:instructions?|consignes?)|ignore\s+(?:all\s+|the\s+)?(?:previous|prior|above)\s+instructions?|system\s*prompt|tu\s+es\s+maintenant|you\s+are\s+now|nouvelle?s?\s+instructions?|<\/?\s*(?:cv|demande|candidats?|system)\s*>)/i;

// --- Utilitaires ----------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Mot entier, sans tenir compte de la casse ni des accents de bordure (\b ne gère pas les accents). */
function wholeWord(name: string): RegExp {
  return new RegExp(`(?<![\\p{L}])${escapeRegExp(name)}(?![\\p{L}])`, "giu");
}

function bump(counts: SanitizeResult["removed"], key: PiiCategory, n: number): void {
  if (n > 0) counts[key] = (counts[key] ?? 0) + n;
}

function replaceCount(
  text: string,
  pattern: RegExp,
  replacement: string,
): { text: string; count: number } {
  let count = 0;
  const out = text.replace(pattern, () => {
    count += 1;
    return replacement;
  });
  return { text: out, count };
}

/** Garde le premier prénom seulement : « Jean-Pierre Martin » → « Jean-Pierre ». */
export function firstNameOnly(fullName: string): string {
  const cleaned = fullName.normalize("NFC").replace(INVISIBLE, "").trim();
  const first = cleaned.split(/\s+/)[0] ?? "";
  // Majuscule initiale propre, tirets conservés (« jean-pierre » → « Jean-Pierre »).
  return first
    .split("-")
    .map((part) => (part ? part.charAt(0).toLocaleUpperCase("fr") + part.slice(1).toLocaleLowerCase("fr") : part))
    .join("-");
}

/** Texte qui ressemble à une consigne ou qui contient des caractères invisibles. */
export function detectSuspicious(text: string): string[] {
  const alerts: string[] = [];
  if (INVISIBLE.test(text)) alerts.push("Caractères invisibles détectés dans le CV (texte potentiellement caché).");
  INVISIBLE.lastIndex = 0;
  if (INJECTION.test(text)) alerts.push("Le CV contient une phrase qui ressemble à une consigne adressée à une IA : à vérifier.");
  return alerts;
}

// --- API principale -------------------------------------------------------

export function sanitizeCvText(input: string, options: SanitizeOptions = {}): SanitizeResult {
  const removed: SanitizeResult["removed"] = {};
  const alerts = detectSuspicious(input);

  let text = input.normalize("NFC");

  const invisible = replaceCount(text, INVISIBLE, "");
  text = invisible.text;
  bump(removed, "caracteres_caches", invisible.count);

  const steps: Array<[PiiCategory, RegExp]> = [
    ["email", EMAIL],
    ["url", URL_LIKE],
    ["telephone", PHONE],
    ["naissance", BIRTH],
    ["naissance", AGE],
    ["adresse", ADDRESS],
    ["code_postal", POSTAL],
    ["ligne_sensible", SENSITIVE_LINE],
  ];
  for (const [category, pattern] of steps) {
    const r = replaceCount(text, pattern, REMOVED);
    text = r.text;
    bump(removed, category, r.count);
  }

  // ORDRE IMPORTANT : employeurs d'abord. Un nom d'employeur peut contenir un nom de famille
  // (« Transports Dubois & Fils ») ; retirer le nom de famille en premier laisserait un
  // employeur à moitié effacé (« Transports & Fils »).
  // Les plus longs d'abord (« Leroy Merlin France » avant « Leroy Merlin »).
  const employers = [...(options.employers ?? [])].map((e) => e.trim()).filter((e) => e.length >= 2);
  employers.sort((a, b) => b.length - a.length);
  for (const name of employers) {
    const r = replaceCount(text, wholeWord(name), EMPLOYER_PLACEHOLDER);
    text = r.text;
    bump(removed, "employeur", r.count);
  }

  // Noms de famille (les plus longs d'abord : « Dubois-Lacoste » avant « Dubois »).
  const familyNames = [...(options.familyNames ?? [])].map((n) => n.trim()).filter((n) => n.length >= 2);
  familyNames.sort((a, b) => b.length - a.length);
  for (const name of familyNames) {
    const r = replaceCount(text, wholeWord(name), REMOVED);
    text = r.text;
    bump(removed, "nom_famille", r.count);
  }

  // Villes et lieux connus (domicile, lieux de mission, écoles) : le lieu d'un poste peut
  // identifier l'employeur ou la personne. Les villes ne se devinent pas : elles sont fournies.
  const places = [...(options.places ?? [])].map((p) => p.trim()).filter((p) => p.length >= 2);
  places.sort((a, b) => b.length - a.length);
  for (const name of places) {
    const r = replaceCount(text, wholeWord(name), PLACE_PLACEHOLDER);
    text = r.text;
    bump(removed, "lieu", r.count);
  }

  // Espaces et lignes vides laissés par les retraits.
  text = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, removed, alerts };
}

/**
 * Contrôle de sortie : cherche ce qui n'aurait jamais dû rester (téléphone, e-mail, URL, adresse,
 * naissance). À appliquer à tout texte avant de l'envoyer à l'IA, et à toute réponse de l'IA.
 */
export function findResidualPii(text: string): PiiCategory[] {
  const checks: Array<[PiiCategory, RegExp]> = [
    ["email", EMAIL],
    ["telephone", PHONE],
    ["url", URL_LIKE],
    ["adresse", ADDRESS],
    ["code_postal", POSTAL],
    ["naissance", BIRTH],
    ["naissance", AGE],
  ];
  const found = new Set<PiiCategory>();
  for (const [category, pattern] of checks) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) found.add(category);
    pattern.lastIndex = 0;
  }
  return [...found];
}

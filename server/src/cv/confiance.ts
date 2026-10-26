/**
 * Score de confiance de la lecture d'un CV (0 à 1).
 * Mesure si le texte extrait a l'air d'un CV lisible : ce n'est PAS un jugement sur le candidat.
 * Sous le seuil, le CV va en file de vérification et n'est proposé à personne avant relecture humaine.
 */

export const SEUIL_VERIFICATION = 0.6;

const SECTIONS = /(exp[ée]riences?|comp[ée]tences?|formations?|dipl[oô]mes?|habilitations?|parcours|profil|langues?|skills?|experience|education)/i;
const ANNEE = /\b(?:19[6-9]\d|20[0-4]\d)\b/g;

export interface ConfianceDetail {
  score: number;
  longueur: number;
  lettres: number;
  dates: number;
  sections: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function scoreConfiance(text: string): ConfianceDetail {
  const compact = text.replace(/\s+/g, "");
  const n = compact.length;
  if (n === 0) return { score: 0, longueur: 0, lettres: 0, dates: 0, sections: 0 };

  // Longueur : rien en dessous de 40 caractères, plein score à partir de 400.
  const longueur = clamp01((n - 40) / 360);

  // Part de lettres : un texte brouillé (mauvaise police, OCR raté) en contient peu.
  const lettres = (compact.match(/\p{L}/gu) ?? []).length / n;
  const partLettres = clamp01((lettres - 0.35) / 0.35);

  // Au moins une année plausible (parcours daté) et un titre de section reconnu.
  const dates = clamp01(((text.match(ANNEE) ?? []).length) / 2);
  const sections = SECTIONS.test(text) ? 1 : 0;

  // Caractères de remplacement (« � ») : signe de mauvaise extraction.
  const remplacement = (text.match(/�/g) ?? []).length / n;

  const score = clamp01(0.35 * longueur + 0.25 * partLettres + 0.2 * dates + 0.2 * sections - remplacement * 5);
  return { score: Math.round(score * 100) / 100, longueur, lettres, dates, sections };
}

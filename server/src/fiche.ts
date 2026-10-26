/**
 * Format de la fiche nettoyée (sortie de l'assistant, voir docs/AGENT_IA.md).
 * Le schéma REFUSE toute fiche qui contiendrait encore des coordonnées ou une identité complète :
 * une réponse invalide est rejetée, jamais « réparée » en silence.
 */
import { z } from "zod";
import { findResidualPii } from "./sanitize.js";

export const DISPONIBILITES = ["Immédiate", "Sous 1 semaine", "Sous 2 semaines", "À confirmer"] as const;

const texteSansPii = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => findResidualPii(v).length === 0, {
      message: "Le texte contient des coordonnées ou des données personnelles.",
    });

export const FicheSchema = z.object({
  /** Prénom seul : un mot (tirets autorisés), sans espace ni nom de famille. */
  prenom: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[\p{L}][\p{L}'’-]*$/u, "Prénom seul, sans espace."),
  poste: texteSansPii(80),
  annees_experience: z.number().int().min(0).max(60),
  dispo: z.enum(DISPONIBILITES),
  competences: z.array(texteSansPii(40)).min(1).max(4),
  points_forts: texteSansPii(200),
  experiences: z
    .array(z.tuple([texteSansPii(40), texteSansPii(80), texteSansPii(300)]))
    .max(8),
  alerte: z.string().trim().max(200).nullable(),
});

export type Fiche = z.infer<typeof FicheSchema>;

export type ParseFicheResult =
  | { ok: true; fiche: Fiche }
  | { ok: false; errors: string[] };

/** Valide la réponse brute (JSON) de l'IA. Toute réponse invalide est rejetée. */
export function parseFiche(raw: unknown): ParseFicheResult {
  const parsed = FicheSchema.safeParse(raw);
  if (parsed.success) return { ok: true, fiche: parsed.data };
  return {
    ok: false,
    errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`),
  };
}

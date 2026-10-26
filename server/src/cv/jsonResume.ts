/**
 * Import d'un CV au format JSON Resume (standard ouvert, https://jsonresume.org).
 * Lecture des champs SANS IA : c'est la voie la plus fiable quand le format est disponible.
 * Tout champ absent ou mal typé est ignoré, jamais inventé.
 */
import { z } from "zod";
import { ProfilCanoniqueSchema, type ProfilCanonique } from "./profil.js";
import { firstNameOnly } from "../sanitize.js";

const s = z.string().optional().catch(undefined);
const arr = <T extends z.ZodTypeAny>(item: T) => z.array(item).optional().catch(undefined);

const JsonResumeSchema = z
  .object({
    basics: z
      .object({
        name: s,
        label: s,
        email: s,
        phone: s,
        summary: s,
        location: z
          .object({ address: s, postalCode: s, city: s })
          .optional()
          .catch(undefined),
      })
      .optional()
      .catch(undefined),
    work: arr(
      z.object({ name: s, position: s, startDate: s, endDate: s, summary: s, highlights: arr(z.string()) }),
    ),
    education: arr(z.object({ studyType: s, area: s, institution: s, endDate: s })),
    skills: arr(z.object({ name: s, keywords: arr(z.string()) })),
    languages: arr(z.object({ language: s, fluency: s })),
    certificates: arr(z.object({ name: s })),
  })
  .passthrough();

export type JsonResumeResult = { ok: true; profil: ProfilCanonique } | { ok: false; errors: string[] };

export function fromJsonResume(raw: unknown, fichier?: string): JsonResumeResult {
  const parsed = JsonResumeSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: ["Document JSON Resume invalide."] };
  const d = parsed.data;
  const b = d.basics;

  const nomComplet = (b?.name ?? "").trim();
  const prenom = nomComplet ? firstNameOnly(nomComplet) : "";
  const nom = nomComplet.split(/\s+/).slice(1).join(" ");

  const competences = (d.skills ?? []).flatMap((sk) => [sk.name, ...(sk.keywords ?? [])]).filter((x): x is string => !!x?.trim());

  const candidat = {
    source: { type: "json-resume" as const, ...(fichier ? { fichier } : {}), confiance: 0.95 },
    prenom,
    nom,
    contact: {
      email: b?.email ?? "",
      telephone: b?.phone ?? "",
      adresse: b?.location?.address ?? "",
      ville: b?.location?.city ?? "",
      codePostal: b?.location?.postalCode ?? "",
    },
    poste_vise: b?.label ?? "",
    resume: b?.summary ?? "",
    experiences: (d.work ?? []).map((w) => ({
      debut: w.startDate ?? "",
      fin: w.endDate ?? "",
      intitule: w.position ?? "",
      employeur: w.name ?? "",
      missions: [w.summary, ...(w.highlights ?? [])].filter((x): x is string => !!x?.trim()).join(" "),
    })),
    formations: (d.education ?? []).map((e) => ({
      annee: e.endDate?.slice(0, 4) ?? "",
      diplome: [e.studyType, e.area].filter((x): x is string => !!x?.trim()).join(" — "),
    })),
    competences: [...new Set(competences)],
    habilitations: (d.certificates ?? []).map((c) => c.name).filter((x): x is string => !!x?.trim()),
    langues: (d.languages ?? []).map((l) => l.language).filter((x): x is string => !!x?.trim()),
    permis: [] as string[],
    disponibilite: "",
  };

  const valide = ProfilCanoniqueSchema.safeParse(candidat);
  if (!valide.success) {
    return { ok: false, errors: valide.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`) };
  }
  if (!valide.data.prenom) return { ok: false, errors: ["basics.name : prénom introuvable."] };
  return { ok: true, profil: valide.data };
}

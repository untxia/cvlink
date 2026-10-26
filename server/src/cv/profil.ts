/**
 * Profil canonique : format commun à tous les CV, quelle que soit leur origine (docs/FORMATS_CV.md).
 * `nom` et `contact` restent dans la base sécurisée : ils ne sont jamais envoyés à l'IA ni affichés.
 * La version nettoyée (fiche) est produite à part, par `sanitize.ts`.
 */
import { z } from "zod";

const texte = (max: number) => z.string().trim().max(max);

export const ExperienceSchema = z.object({
  debut: texte(20),
  fin: texte(20),
  intitule: texte(120),
  employeur: texte(120),
  missions: texte(2000),
});

export const ProfilCanoniqueSchema = z.object({
  source: z.object({
    type: z.enum(["pdf", "html", "texte", "json-resume", "ats"]),
    fichier: texte(200).optional(),
    /** 0 à 1. 0.95 pour un format structuré lu sans IA ; le score d'extraction sinon. */
    confiance: z.number().min(0).max(1),
  }),
  prenom: texte(60),
  nom: texte(80),
  contact: z.object({
    email: texte(120),
    telephone: texte(40),
    adresse: texte(300),
    ville: texte(80),
    codePostal: texte(10),
  }),
  poste_vise: texte(120),
  resume: texte(1500),
  experiences: z.array(ExperienceSchema).max(30),
  formations: z.array(z.object({ annee: texte(20), diplome: texte(160) })).max(20),
  competences: z.array(texte(80)).max(60),
  habilitations: z.array(texte(80)).max(30),
  langues: z.array(texte(60)).max(15),
  permis: z.array(texte(20)).max(10),
  disponibilite: texte(60),
});

export type ProfilCanonique = z.infer<typeof ProfilCanoniqueSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;

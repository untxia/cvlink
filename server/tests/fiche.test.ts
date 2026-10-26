import { describe, expect, it } from "vitest";
import { parseFiche } from "../src/fiche.js";

const valide = {
  prenom: "Marc",
  poste: "Cariste",
  annees_experience: 8,
  dispo: "Immédiate",
  competences: ["CACES 1-3-5", "Gerbeur", "Picking"],
  points_forts: "Rigoureux, autonome, habitué aux cadences de plateforme logistique.",
  experiences: [["2019–2024", "Cariste", "Chargement, déchargement, inventaires."]],
  alerte: null,
};

describe("parseFiche", () => {
  it("accepte une fiche propre", () => {
    const r = parseFiche(valide);
    expect(r.ok).toBe(true);
  });

  it("refuse un nom complet à la place du prénom", () => {
    const r = parseFiche({ ...valide, prenom: "Marc Lefebvre" });
    expect(r.ok).toBe(false);
  });

  it("refuse un téléphone caché dans un champ texte", () => {
    const r = parseFiche({ ...valide, points_forts: "Joignable au 06 12 34 56 78." });
    expect(r.ok).toBe(false);
  });

  it("refuse un e-mail dans une expérience", () => {
    const r = parseFiche({
      ...valide,
      experiences: [["2019", "Cariste", "Contact : marc@exemple.fr"]],
    });
    expect(r.ok).toBe(false);
  });

  it("refuse une disponibilité hors liste", () => {
    expect(parseFiche({ ...valide, dispo: "Quand je veux" }).ok).toBe(false);
  });

  it("refuse plus de 4 compétences et une fiche sans compétence", () => {
    expect(parseFiche({ ...valide, competences: ["a", "b", "c", "d", "e"] }).ok).toBe(false);
    expect(parseFiche({ ...valide, competences: [] }).ok).toBe(false);
  });

  it("rejette tout ce qui n'est pas un objet", () => {
    expect(parseFiche(null).ok).toBe(false);
    expect(parseFiche("texte libre").ok).toBe(false);
  });

  it("retourne des erreurs lisibles", () => {
    const r = parseFiche({ ...valide, prenom: "Marc Lefebvre" });
    if (r.ok) throw new Error("devait échouer");
    expect(r.errors[0]).toContain("prenom");
  });
});

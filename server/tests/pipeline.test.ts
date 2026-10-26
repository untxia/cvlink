import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { firstNameOnly, findResidualPii, sanitizeCvText } from "../src/sanitize.js";

const here = dirname(fileURLToPath(import.meta.url));
const brut = readFileSync(join(here, "fixtures", "cv-brut-fictif.txt"), "utf8");

describe("nettoyage de bout en bout sur un CV brut fictif", () => {
  const r = sanitizeCvText(brut, {
    familyNames: ["Dubois-Lacoste", "Dubois", "Lacoste"],
    employers: ["Leroy Merlin France", "Manpower", "Carrefour Supply Chain", "Transports Dubois-Lacoste & Fils"],
    places: ["Lescar", "Tarbes", "Pau"],
  });

  it("ne laisse aucune coordonnée ni donnée d'identité", () => {
    expect(findResidualPii(r.text)).toEqual([]);
    for (const interdit of [
      "06.12.34.56.78",
      "@exemple.fr",
      "linkedin",
      "Tilleuls",
      "64230",
      "Lescar",
      "1988",
      "36 ans",
      "française",
      "mariée",
      "enfants",
      "Dubois",
      "Lacoste",
      "Leroy Merlin",
      "Manpower",
      "Carrefour",
      "Transports",
      "Fils",
      "AFPA Pau",
    ]) {
      expect(r.text, `« ${interdit} » ne doit pas rester`).not.toContain(interdit);
    }
  });

  it("garde ce qui sert au poste", () => {
    for (const utile of [
      "CACES 1-3-5",
      "SST",
      "habilitation électrique B0",
      "Cariste",
      "120 palettes par jour",
      "Picking vocal",
      "inventaires tournants",
      "03/2021 – 12/2025",
    ]) {
      expect(r.text, `« ${utile} » doit rester`).toContain(utile);
    }
  });

  it("remplace les employeurs par un marqueur", () => {
    expect(r.text).toContain("[employeur]");
    expect(r.removed.employeur).toBeGreaterThanOrEqual(4);
  });

  it("le prénom est extrait seul", () => {
    expect(firstNameOnly("Karine DUBOIS-LACOSTE")).toBe("Karine");
  });
});

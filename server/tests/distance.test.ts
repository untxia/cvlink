import { describe, expect, it } from "vitest";
import { filterEligible, haversineKm, isValidPoint, type CandidateGeo } from "../src/distance.js";

const PAU = { lat: 43.2951, lon: -0.3708 };
const LESCAR = { lat: 43.3333, lon: -0.4333 }; // ~ 7 km de Pau
const TARBES = { lat: 43.2328, lon: 0.0781 }; // ~ 37 km de Pau
const BORDEAUX = { lat: 44.8378, lon: -0.5792 }; // ~ 170 km de Pau

const cand = (id: string, org: string, point: CandidateGeo["point"], disponible = true): CandidateGeo => ({
  id,
  organisationId: org,
  point,
  disponible,
});

describe("haversineKm", () => {
  it("vaut 0 pour le même point", () => {
    expect(haversineKm(PAU, PAU)).toBe(0);
  });
  it("donne des distances réalistes", () => {
    expect(haversineKm(PAU, LESCAR)).toBeGreaterThan(5);
    expect(haversineKm(PAU, LESCAR)).toBeLessThan(9);
    expect(haversineKm(PAU, TARBES)).toBeGreaterThan(33);
    expect(haversineKm(PAU, TARBES)).toBeLessThan(41);
    expect(haversineKm(PAU, BORDEAUX)).toBeGreaterThan(160);
    expect(haversineKm(PAU, BORDEAUX)).toBeLessThan(180);
  });
  it("est symétrique", () => {
    expect(haversineKm(PAU, TARBES)).toBeCloseTo(haversineKm(TARBES, PAU), 9);
  });
  it("refuse des coordonnées invalides", () => {
    expect(() => haversineKm({ lat: 95, lon: 0 }, PAU)).toThrow(RangeError);
    expect(() => haversineKm({ lat: Number.NaN, lon: 0 }, PAU)).toThrow(RangeError);
  });
});

describe("isValidPoint", () => {
  it("rejette null, NaN et hors bornes", () => {
    expect(isValidPoint(null)).toBe(false);
    expect(isValidPoint({ lat: 0, lon: 181 })).toBe(false);
    expect(isValidPoint({ lat: 43, lon: -0.3 })).toBe(true);
  });
});

describe("filterEligible", () => {
  const base = { organisationId: "org-A", center: PAU, radiusKm: 20 };

  it("garde seulement les candidats du rayon, du plus proche au plus éloigné", () => {
    const res = filterEligible(
      [cand("tarbes", "org-A", TARBES), cand("lescar", "org-A", LESCAR), cand("pau", "org-A", PAU)],
      base,
    );
    expect(res.map((r) => r.candidate.id)).toEqual(["pau", "lescar"]);
  });

  it("ne retourne JAMAIS un candidat d'une autre organisation", () => {
    const res = filterEligible([cand("autre", "org-B", PAU), cand("mien", "org-A", PAU)], base);
    expect(res.map((r) => r.candidate.id)).toEqual(["mien"]);
  });

  it("exclut les indisponibles (par défaut) et les inclut sur demande", () => {
    const list = [cand("dispo", "org-A", PAU), cand("pris", "org-A", LESCAR, false)];
    expect(filterEligible(list, base).map((r) => r.candidate.id)).toEqual(["dispo"]);
    expect(filterEligible(list, { ...base, onlyAvailable: false }).map((r) => r.candidate.id)).toEqual([
      "dispo",
      "pris",
    ]);
  });

  it("exclut les candidats sans coordonnées valides, sans deviner", () => {
    const res = filterEligible(
      [cand("inconnu", "org-A", null), cand("faux", "org-A", { lat: 999, lon: 0 }), cand("ok", "org-A", PAU)],
      base,
    );
    expect(res.map((r) => r.candidate.id)).toEqual(["ok"]);
  });

  it("refuse un rayon au-dessus du plafond au lieu de le corriger en silence", () => {
    expect(() => filterEligible([], { ...base, radiusKm: 50 })).toThrow(RangeError);
    expect(() => filterEligible([], { ...base, radiusKm: 50, maxRadiusKm: 60 })).not.toThrow();
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])("refuse un rayon invalide : %s", (radiusKm) => {
    expect(() => filterEligible([], { ...base, radiusKm })).toThrow(RangeError);
  });

  it("exige une organisation", () => {
    expect(() => filterEligible([], { ...base, organisationId: "" })).toThrow();
  });

  it("zéro résultat est une réponse valide", () => {
    expect(filterEligible([cand("loin", "org-A", BORDEAUX)], base)).toEqual([]);
  });
});

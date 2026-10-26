/**
 * Filtre dur : organisation, disponibilité et distance.
 * Calculé par le CODE, jamais par l'IA : le rayon est une règle absolue.
 * L'IA ne reçoit que les candidats qui passent ce filtre.
 */

export interface GeoPoint {
  /** Latitude en degrés décimaux (−90 à 90). */
  lat: number;
  /** Longitude en degrés décimaux (−180 à 180). */
  lon: number;
}

export interface CandidateGeo {
  id: string;
  organisationId: string;
  /** Coordonnées géocodées une seule fois à l'import ; null si l'adresse n'a pas pu être trouvée. */
  point: GeoPoint | null;
  disponible: boolean;
}

export interface EligibleCandidate<T extends CandidateGeo = CandidateGeo> {
  candidate: T;
  distanceKm: number;
}

export interface EligibilityQuery {
  organisationId: string;
  /** Lieu de la mission. */
  center: GeoPoint;
  radiusKm: number;
  /** Plafond de sécurité (le prototype plafonne à 20 km ; une organisation peut le régler). */
  maxRadiusKm?: number;
  /** Ne garder que les candidats disponibles (par défaut : oui). */
  onlyAvailable?: boolean;
}

const EARTH_RADIUS_KM = 6371.0088;

export function isValidPoint(p: GeoPoint | null | undefined): p is GeoPoint {
  return (
    !!p &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon) &&
    p.lat >= -90 &&
    p.lat <= 90 &&
    p.lon >= -180 &&
    p.lon <= 180
  );
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distance à vol d'oiseau en kilomètres (formule de haversine). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  if (!isValidPoint(a) || !isValidPoint(b)) throw new RangeError("Coordonnées invalides.");
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Candidats de l'organisation, disponibles, dans le rayon, du plus proche au plus éloigné.
 * - un candidat d'une autre organisation n'est JAMAIS retourné ;
 * - un candidat sans coordonnées valides est exclu (on ne devine pas) ;
 * - un rayon invalide ou supérieur au plafond lève une erreur au lieu d'être corrigé en silence.
 */
export function filterEligible<T extends CandidateGeo>(
  candidates: readonly T[],
  query: EligibilityQuery,
): EligibleCandidate<T>[] {
  const { organisationId, center, radiusKm, maxRadiusKm = 20, onlyAvailable = true } = query;

  if (!organisationId) throw new Error("Organisation obligatoire.");
  if (!isValidPoint(center)) throw new RangeError("Lieu de la mission invalide.");
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) throw new RangeError("Rayon invalide.");
  if (radiusKm > maxRadiusKm) {
    throw new RangeError(`Rayon de ${radiusKm} km supérieur au plafond autorisé (${maxRadiusKm} km).`);
  }

  const out: EligibleCandidate<T>[] = [];
  for (const candidate of candidates) {
    if (candidate.organisationId !== organisationId) continue;
    if (onlyAvailable && !candidate.disponible) continue;
    if (!isValidPoint(candidate.point)) continue;
    const distanceKm = haversineKm(center, candidate.point);
    if (distanceKm <= radiusKm) out.push({ candidate, distanceKm });
  }
  out.sort((x, y) => x.distanceKm - y.distanceKm);
  return out;
}

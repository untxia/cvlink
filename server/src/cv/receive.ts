/**
 * Réception sûre d'un fichier de CV (étape 1 de docs/FORMATS_CV.md).
 * On détermine le TYPE RÉEL d'après le contenu, jamais d'après l'extension ni le type annoncé,
 * et on refuse tout ce qui est trop gros ou que l'on ne sait pas lire.
 */

export type DetectedFormat = "pdf" | "html" | "texte" | "office" | "inconnu";

export const LIMITS = {
  /** Taille maximale d'un fichier de CV. */
  maxBytes: 10 * 1024 * 1024,
  /** Nombre de pages maximal d'un PDF. */
  maxPages: 15,
} as const;

export type RejectCode = "vide" | "trop_gros" | "format_non_pris_en_charge" | "trop_de_pages" | "illisible";

export class CvRejete extends Error {
  readonly code: RejectCode;
  constructor(code: RejectCode, message: string) {
    super(message);
    this.name = "CvRejete";
    this.code = code;
  }
}

const startsWith = (buf: Uint8Array, ascii: string, from = 0): boolean => {
  if (buf.length < from + ascii.length) return false;
  for (let i = 0; i < ascii.length; i++) if (buf[from + i] !== ascii.charCodeAt(i)) return false;
  return true;
};

/** Décode en UTF-8 strict ; renvoie null si le contenu n'est pas du texte UTF-8 valide. */
export function decodeUtf8Strict(buf: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return null;
  }
}

export function detectFormat(buf: Uint8Array): DetectedFormat {
  if (buf.length === 0) return "inconnu";

  // PDF : « %PDF- » dans les premiers octets.
  const head = buf.subarray(0, 1024);
  for (let i = 0; i + 5 <= head.length; i++) if (startsWith(head, "%PDF-", i)) return "pdf";

  // Archive ZIP (docx, odt, xlsx, mais aussi n'importe quelle archive) : non prise en charge dans cette version.
  if (startsWith(buf, "PK\x03\x04")) return "office";

  // Exécutables et formats binaires courants : jamais lus.
  if (startsWith(buf, "MZ") || startsWith(buf, "\x7fELF") || startsWith(buf, "\xff\xd8\xff") || startsWith(buf, "\x89PNG")) {
    return "inconnu";
  }

  // Octets nuls = binaire.
  const sample = buf.subarray(0, Math.min(buf.length, 4096));
  if (sample.includes(0)) return "inconnu";

  // Échantillon décodé sans erreur fatale : un caractère coupé en fin d'échantillon ne doit pas
  // faire rejeter un fichier valide. Beaucoup de caractères de remplacement = pas du texte UTF-8.
  const extrait = new TextDecoder("utf-8", { fatal: false }).decode(buf.subarray(0, Math.min(buf.length, 64 * 1024)));
  const remplacements = (extrait.match(/�/g) ?? []).length;
  if (remplacements > Math.max(1, extrait.length * 0.005)) return "inconnu";

  if (/<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(extrait.slice(0, 4096))) return "html";
  return "texte";
}

/** Vérifie la taille et le type ; lève CvRejete sinon. */
export function assertAcceptable(buf: Uint8Array): DetectedFormat {
  if (buf.length === 0) throw new CvRejete("vide", "Fichier vide.");
  if (buf.length > LIMITS.maxBytes) {
    throw new CvRejete("trop_gros", `Fichier trop gros (${Math.round(buf.length / 1024 / 1024)} Mo, maximum ${LIMITS.maxBytes / 1024 / 1024} Mo).`);
  }
  const format = detectFormat(buf);
  if (format === "office") {
    throw new CvRejete("format_non_pris_en_charge", "Les fichiers Word/OpenDocument ne sont pas encore pris en charge : exporter en PDF.");
  }
  if (format === "inconnu") {
    throw new CvRejete("format_non_pris_en_charge", "Format de fichier non reconnu ou non pris en charge.");
  }
  return format;
}

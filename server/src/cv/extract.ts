/**
 * Extraction du texte d'un CV (étape 2 de docs/FORMATS_CV.md) : PDF avec texte, HTML, texte, Markdown.
 * Non gérés dans cette version, et signalés comme tels : scans/images (OCR), Word/ODT.
 *
 * Principe de sécurité : le texte extrait est une DONNÉE. Les scripts, styles, commentaires, éléments
 * cachés et texte minuscule sont retirés et signalés ; aucun lien n'est jamais suivi.
 */
import { getDocumentProxy } from "unpdf";
import { parse as parseHtml, type HTMLElement } from "node-html-parser";
import { SEUIL_VERIFICATION, scoreConfiance } from "./confiance.js";
import { LIMITS, CvRejete, assertAcceptable, decodeUtf8Strict, type DetectedFormat } from "./receive.js";
import { detectSuspicious } from "../sanitize.js";

export interface ExtractionResult {
  format: Exclude<DetectedFormat, "inconnu" | "office">;
  text: string;
  pages: number | null;
  /** 0 à 1 : lisibilité de l'extraction. */
  confiance: number;
  /** Signalements à montrer au recruteur (texte caché, scan, colonnes, consigne suspecte…). */
  alertes: string[];
  /** Vrai si un humain doit relire avant que le CV soit proposé à qui que ce soit. */
  aVerifier: boolean;
}

// Texte PDF sous cette hauteur (en points) : illisible à l'œil, typique du texte caché.
const HAUTEUR_MIN_VISIBLE = 3;
const MIN_CARACTERES_PAR_PAGE = 40;

// --- PDF ------------------------------------------------------------------

interface Item {
  str: string;
  x: number;
  y: number;
  h: number;
  w: number;
}

function lignesDepuisItems(items: Item[]): { lignes: string[]; grandsEcarts: number } {
  // Du haut vers le bas (y décroissant), puis de gauche à droite.
  const tries = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const groupes: Item[][] = [];
  for (const it of tries) {
    const dernier = groupes[groupes.length - 1];
    const ref = dernier?.[0];
    if (dernier && ref && Math.abs(ref.y - it.y) <= Math.max(2, ref.h * 0.45)) dernier.push(it);
    else groupes.push([it]);
  }
  let grandsEcarts = 0;
  const lignes = groupes.map((g) => {
    g.sort((a, b) => a.x - b.x);
    let out = "";
    let finPrec = 0;
    g.forEach((it, i) => {
      if (i === 0) {
        out = it.str;
      } else {
        const ecart = it.x - finPrec;
        const colle = out.endsWith(" ") || it.str.startsWith(" ");
        if (ecart > 120) grandsEcarts += 1;
        out += colle ? it.str : ecart > 24 ? "  " + it.str : ecart > 1.5 ? " " + it.str : it.str;
      }
      finPrec = it.x + it.w;
    });
    return out.trimEnd();
  });
  return { lignes, grandsEcarts };
}

async function extrairePdf(data: Uint8Array): Promise<ExtractionResult> {
  let pdf;
  try {
    // unpdf transfère le tampon : on lui donne une copie.
    pdf = await getDocumentProxy(new Uint8Array(data));
  } catch {
    throw new CvRejete("illisible", "PDF illisible ou protégé.");
  }
  if (pdf.numPages > LIMITS.maxPages) {
    throw new CvRejete("trop_de_pages", `PDF de ${pdf.numPages} pages (maximum ${LIMITS.maxPages}).`);
  }

  const alertes: string[] = [];
  const pagesTexte: string[] = [];
  let caracteresCaches = 0;
  let pagesEnColonnes = 0;

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const contenu = await page.getTextContent();
    const items: Item[] = [];
    for (const raw of contenu.items) {
      if (!("str" in raw) || raw.str.trim() === "") continue;
      const [, , , , x = 0, y = 0] = raw.transform as number[];
      const h = Math.abs(raw.height || 0);
      if (h < HAUTEUR_MIN_VISIBLE) {
        caracteresCaches += raw.str.length;
        continue;
      }
      // Le lecteur PDF ne renvoie déjà pas le texte posé hors de la page (vérifié par test) :
      // il est exclu, mais on ne peut pas le signaler. Le texte blanc sur fond blanc, lui, n'est
      // PAS détectable avec cette méthode (la couleur n'est pas exposée) : voir les limites du README.
      items.push({ str: raw.str, x, y, h, w: raw.width });
    }
    const { lignes, grandsEcarts } = lignesDepuisItems(items);
    if (grandsEcarts >= 6) pagesEnColonnes += 1;
    pagesTexte.push(lignes.join("\n"));
  }

  if (caracteresCaches > 0) {
    alertes.push(`Texte minuscule ou invisible ignoré dans le PDF (${caracteresCaches} caractères) : CV à relire.`);
  }
  if (pagesEnColonnes > 0) {
    alertes.push("Mise en page en colonnes probable : l'ordre de lecture est à vérifier.");
  }

  const text = pagesTexte.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  let confiance = scoreConfiance(text).score;
  let forceVerif = caracteresCaches > 0;

  if (text.replace(/\s/g, "").length < MIN_CARACTERES_PAR_PAGE * pdf.numPages) {
    alertes.push("Peu ou pas de texte extractible : probablement un scan ou une image. L'OCR n'est pas disponible dans cette version.");
    confiance = Math.min(confiance, 0.2);
    forceVerif = true;
  }
  if (pagesEnColonnes > 0) confiance = Math.max(0, confiance - 0.15);

  return { format: "pdf", text, pages: pdf.numPages, confiance, alertes, aVerifier: forceVerif };
}

// --- HTML -----------------------------------------------------------------

const BALISES_A_RETIRER = "script,style,noscript,template,iframe,object,embed,svg,canvas,head,nav,footer,form,button,select,option";
const STYLE_CACHE =
  /display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?\s*(?:;|$)|font-size\s*:\s*0(?:px|pt|em|rem)?\s*(?:;|$)|(?:height|width)\s*:\s*0(?:px)?\s*;[^"]*overflow\s*:\s*hidden|text-indent\s*:\s*-\d{3,}/i;

function elementCache(el: HTMLElement): boolean {
  if (el.hasAttribute("hidden")) return true;
  const style = el.getAttribute("style");
  return !!style && STYLE_CACHE.test(style);
}

function extraireHtml(source: string): ExtractionResult {
  const alertes: string[] = [];
  const racine = parseHtml(source, { comment: false, blockTextElements: { script: false, style: false, noscript: false, pre: true } });

  let caches = 0;
  for (const el of racine.querySelectorAll("*")) {
    if (elementCache(el) && el.text.trim()) {
      caches += el.text.length;
      el.remove();
    }
  }
  if (caches > 0) alertes.push(`Éléments cachés ignorés dans la page (${caches} caractères) : CV à relire.`);

  for (const el of racine.querySelectorAll(BALISES_A_RETIRER)) el.remove();

  const text = racine.structuredText
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const confiance = scoreConfiance(text).score;
  return { format: "html", text, pages: null, confiance, alertes, aVerifier: caches > 0 };
}

// --- Texte / Markdown -----------------------------------------------------

function extraireTexte(source: string): ExtractionResult {
  const text = source
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { format: "texte", text, pages: null, confiance: scoreConfiance(text).score, alertes: [], aVerifier: false };
}

// --- Point d'entrée -------------------------------------------------------

/**
 * Lit un fichier de CV. Lève `CvRejete` si le fichier est refusé (vide, trop gros, format inconnu…).
 * Ne renvoie jamais de texte brut sans score ni signalements.
 */
export async function extractCv(data: Uint8Array): Promise<ExtractionResult> {
  const format = assertAcceptable(data);

  let res: ExtractionResult;
  if (format === "pdf") {
    res = await extrairePdf(data);
  } else {
    const source = decodeUtf8Strict(data);
    if (source === null) throw new CvRejete("illisible", "Encodage non pris en charge (UTF-8 attendu).");
    res = format === "html" ? extraireHtml(source) : extraireTexte(source);
  }

  // Consignes adressées à une IA et caractères invisibles : le CV part en relecture.
  const suspects = detectSuspicious(res.text);
  if (suspects.length > 0) {
    res.alertes.push(...suspects);
    res.aVerifier = true;
  }
  if (res.confiance < SEUIL_VERIFICATION) res.aVerifier = true;
  return res;
}

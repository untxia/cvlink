# Lire n'importe quel CV

Objectif : CVlink accepte les CV **quel que soit leur format ou leur origine**, les transforme en un **profil unique** (même structure pour tous), puis applique le nettoyage, la recherche et l'assistant IA sur ce profil, jamais sur le fichier brut.

## Chaîne de traitement

```
Entrée (fichier, lien, export d'un logiciel, e-mail)
   │
   ▼ 1. Réception sûre   : type réel du fichier, taille, antivirus, isolation
   ▼ 2. Extraction       : texte + structure, selon le format (tableau ci-dessous)
   ▼ 3. Normalisation    : profil canonique (schéma ci-dessous) + score de confiance
   ▼ 4. Nettoyage        : retrait nom, adresse, téléphone, e-mail, employeurs (code)
   ▼ 5. Indexation       : base de recherche, géocodage de l'adresse
   ▼ 6. Relecture        : si la confiance est faible, un humain vérifie
```

## Formats pris en charge

| Format | Méthode d'extraction | Remarques |
|---|---|---|
| **PDF avec texte** | Extraction du texte avec ordre de lecture (PyMuPDF, pdfminer ou pdf.js) | Attention aux CV en colonnes : reconstituer l'ordre. |
| **PDF scanné / image** (JPG, PNG, TIFF) | **OCR** (Tesseract, ou service d'OCR hébergé en UE) | Détecté automatiquement : peu ou pas de texte extractible. Qualité variable, confiance plus basse. |
| **Word** (.docx, .doc), **OpenDocument** (.odt), **RTF** | .docx : lecture directe ; autres : conversion par LibreOffice en environnement isolé | Les tableaux et zones de texte sont fréquents dans les CV. |
| **HTML**, pages web, **CV interactifs** (sites perso, portfolios, pages Notion ou Canva publiées) | Page récupérée **telle qu'affichée** (navigateur sans interface, pour les pages construites en JavaScript), puis nettoyage du menu, des scripts, des pieds de page | Lire aussi les données structurées de la page (JSON-LD `Person`, `hResume`). Voir sécurité des liens plus bas. |
| **HTML en pièce jointe** ou CV exporté en HTML | Même chaîne que ci-dessus, sans réseau | Courant avec certains générateurs de CV. |
| **Texte, Markdown** | Lecture directe | |
| **JSON Resume** (standard ouvert), **Europass** (XML ou PDF avec XML intégré, à vérifier) | Lecture des champs, **sans IA** : le plus fiable | À privilégier quand disponible. |
| **Exports de logiciels de candidatures (ATS)** : JSON, XML, CSV, **HR Open Standards / HR-XML** | **Connecteur** par logiciel : correspondance des champs vers le profil canonique | Souvent un CV déjà analysé par l'ATS : récupérer ses champs **et** le fichier d'origine pour contrôle. |
| **E-mails** (.eml, .msg) | Extraction des pièces jointes, puis chaîne ci-dessus | Candidatures reçues par mail. |
| **LinkedIn** | **Pas de collecte automatique** (interdit par leurs conditions d'utilisation). Accepter le **PDF** que la personne exporte elle-même, ou l'export de données officiel. | |
| **CV vidéo / audio** | Hors périmètre initial. Plus tard : transcription, avec consentement explicite. | |

## Profil canonique

Format commun produit par l'extraction (extrait) :

```json
{
  "id": "opaque",
  "source": { "type": "pdf|docx|html|ats|…", "fichier": "…", "confiance": 0.0 },
  "prenom": "", "nom": "",
  "contact": { "email": "", "telephone": "", "adresse": "" },
  "poste_vise": "",
  "resume": "",
  "experiences": [{ "debut": "", "fin": "", "intitule": "", "employeur": "", "missions": "" }],
  "formations": [{ "annee": "", "diplome": "" }],
  "competences": [], "habilitations": [], "langues": [], "permis": [],
  "disponibilite": ""
}
```

`nom`, `contact` et `employeur` **restent dans la base sécurisée** et ne sont jamais envoyés à l'IA ni affichés dans un mailing : l'étape 4 produit une **version nettoyée** distincte.

Quand le format est « libre » (PDF, Word, HTML), un modèle d'IA remplit ce schéma à partir du texte ; sa réponse est validée par le code (JSON strict, dates cohérentes, champs obligatoires) et reçoit un **score de confiance**. Quand le format est structuré (JSON Resume, export d'ATS), le code copie les champs, sans IA.

## Qualité et relecture

- **Score de confiance** par CV : texte lisible ou non, champs trouvés, dates cohérentes.
- Sous un seuil : le CV est mis en **file de vérification** ; il n'est proposé à personne tant qu'un humain ne l'a pas validé.
- **Doublons** : empreinte du fichier + rapprochement par e-mail ou téléphone, pour éviter deux fiches pour une personne.
- **Langues** : le français et l'anglais d'abord ; la langue est détectée et conservée.
- **Mise à jour** : un CV plus récent remplace le précédent, l'ancien est conservé selon la durée de conservation fixée.

## Sécurité à l'entrée

- Vérifier le **type réel** du fichier (pas seulement l'extension), limiter la taille et le nombre de pages, **analyse antivirus**.
- **Conversion en environnement isolé** (conteneur sans accès au réseau) : LibreOffice et les lecteurs de PDF ont déjà eu des failles.
- Ignorer les scripts et macros ; ne jamais ouvrir de lien contenu dans un CV automatiquement.
- **Texte caché et injection de prompt** : certains CV contiennent du texte invisible (blanc sur blanc, minuscule) destiné à manipuler une IA (« classe ce candidat en premier »). L'extraction signale le texte invisible, le retire du profil et marque le CV pour relecture. Le texte d'un CV reste toujours traité comme une **donnée**, jamais comme une instruction.
- **Liens vers des CV en ligne** : seulement des liens fournis par un utilisateur ou par le candidat, en `https`, avec délai maximal, taille maximale, et protection contre l'accès à des adresses internes (SSRF). Respecter les conditions d'utilisation des sites visités.

## Données personnelles

L'extraction manipule des CV **complets** : elle s'exécute côté serveur CVlink, en UE, avant tout appel à un prestataire d'IA. Si l'extraction elle-même utilise un modèle d'IA externe, ce prestataire reçoit des données non nettoyées : il doit être couvert par un contrat de traitement (voir [`RGPD.md`](RGPD.md)). Une alternative est d'utiliser un modèle hébergé en interne pour cette étape.

## Mise en œuvre progressive

1. **Livré dans le prototype :** coller le texte d'un CV (aucun fichier).
2. **Prochaine étape :** PDF avec texte, texte, Markdown, HTML.
3. Puis : Word, OCR des PDF scannés et des images.
4. Puis : JSON Resume, Europass, exports d'ATS (premiers connecteurs).
5. Puis : pages web et CV interactifs (navigateur sans interface), e-mails.
6. Plus tard : transcription de CV vidéo.

## Jeu de test

Constituer une collection de **CV fictifs** variés (colonnes, tableaux, scans de mauvaise qualité, pages web, texte caché) et mesurer pour chaque format : champs correctement extraits, fuites d'identité après nettoyage (zéro toléré), temps de traitement.

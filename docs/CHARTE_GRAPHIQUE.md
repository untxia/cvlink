# Charte graphique CVlink — v2.0

Identité visuelle de **CVlink** : logo, couleurs, typographie, effets, mouvement, ton et mise en page du bloc de mailing. Les valeurs de référence sont dans [`assets/tokens.css`](../assets/tokens.css).

CVlink est un produit **indépendant**. Son identité (tuile indigo, lettres indigo et turquoise) est propre et ne reprend aucun élément d'une autre marque.

## 1. Idée de marque

- **Nom :** CVlink. « CV » dit le contenu, « link » dit le geste : un prénom cliquable qui ouvre le profil.
- **Promesse :** *le bon profil, au bon endroit.*
- **Public :** sociétés RH, cabinets de recrutement, agences d'emploi et services RH d'entreprises.
- **Personnalité :** fiable, rapide, humaine, moderne. Un outil de travail : de la clarté avant le décor.

## 2. Logo

| Fichier | Usage |
|---|---|
| `assets/logo.svg` | Logo complet animé (l'icône flotte). Web et application. |
| `assets/logo-static.svg` | Logo complet fixe. Documents, impression, e-mails. |
| `assets/logo.png` | Logo complet fixe, fond transparent. Messagerie, Word, présentations. |
| `assets/logo-icon.svg` / `logo-icon-static.svg` / `logo-icon.png` | Icône seule (tuile + maillon). Favicon, avatar, application mobile. |

**Construction.** Une tuile en verre indigo, épaisse, avec un maillon de chaîne chromé ; le mot-symbole « CV LINK » en capitales à coins coupés, extrudées en 3D avec un biseau brillant : **« CV » en indigo, « LINK » en turquoise**.

**Zone de protection.** Laisser autour du logo un espace libre au moins égal à la hauteur d'une lettre.

**Taille minimale.** Logo complet : 120 px de large (30 mm en impression). Icône seule : 24 px (utiliser `logo-icon-static.svg`).

**Fonds.**
- Fond clair : logo tel quel.
- Fond sombre : le logo reste lisible (dégradés clairs) ; pour le texte d'interface, utiliser `--wordmark` clair.
- Éviter les fonds photo chargés ; au besoin, poser le logo sur une pastille blanche.

**À ne pas faire.** Étirer ou incliner le logo ; changer les couleurs de la tuile ; intervertir indigo et turquoise ; retirer l'extrusion des lettres ; ajouter un contour ou une ombre ; animer l'icône dans un e-mail (utiliser la version fixe).

## 3. Couleurs

### Marque

| Nom | Hex | Usage |
|---|---|---|
| Indigo | `#4f46e5` | Tuile du logo, « CV », illustrations. |
| Indigo profond | `#1e1b4b` | Mot-symbole et titres sur fond clair. |
| Turquoise | `#14b8a6` | « LINK » dans le logo, éléments décoratifs. **Jamais pour du texte** (2,5:1 sur blanc). |
| Turquoise texte | `#0f766e` | Si du turquoise doit porter du texte (5,5:1 sur blanc). |

### Interface (thème clair)

| Jeton | Hex | Usage | Contraste |
|---|---|---|---|
| `--accent` | `#4338ca` | Liens, boutons, focus | 7,9:1 sur blanc |
| `--ink` | `#17232e` | Texte principal | 14,1:1 sur `--bg` |
| `--muted` | `#5a6877` | Texte secondaire | 5,7:1 sur blanc |
| `--bg` | `#eef1f3` | Fond de page | — |
| `--surface` | `#ffffff` | Cartes, panneaux | — |
| `--line` | `#d5dce2` | Filets, bordures | — |
| `--accent-soft` | `#e0e7ff` | Ligne sélectionnée, fonds doux | — |
| `--ok` / `--warn` | `#1a7f4b` / `#9a5b00` | Disponible / à confirmer | 5,0:1 / 5,4:1 |
| `--demo` | `#b42318` | Étiquette « Démo · CV fictifs » | 6,6:1 |

### Interface (thème sombre)

| Jeton | Hex | Contraste |
|---|---|---|
| `--bg` | `#0f171e` | — |
| `--surface` | `#17212b` | — |
| `--ink` | `#e8eef3` | 15,5:1 sur `--bg` |
| `--accent` | `#a5b4fc` | 9,1:1 sur `--bg` |

Les contrastes respectent le niveau AA des WCAG 2.1 (4,5:1 pour le texte courant). Le thème sombre suit le réglage de l'appareil (`prefers-color-scheme`) et peut être forcé avec `data-theme="dark"` ou `"light"`.

## 4. Typographie

| Rôle | Police | Remarque |
|---|---|---|
| Interface et textes | **IBM Plex Sans** (400, 500, 600) | Lisible, sobre, bon rendu des accents. |
| Données (étiquettes, valeurs) | **IBM Plex Mono** (400, 500) | Étiquettes en capitales espacées. |
| Titres éditoriaux | **Fraunces** (600) | Réservé aux titres longs (site, documents) ; le logo remplace le titre de page. |

Polices de secours : `system-ui`, `Georgia`, `ui-monospace`. Corps de texte à 14–16 px, pas de texte sous 12 px. Le mot-symbole du logo est **dessiné** (tracés vectoriels) : il ne dépend d'aucune police.

## 5. Effets et matières

- **Verre :** dégradé indigo `#a99bff → #5b50ee → #2d2aa6`, reflet radial en haut à gauche, liseré clair de 1 px, arc de brillance.
- **Chrome :** maillon en dégradé blanc → lavande (`#ffffff → #e3e0ff → #a9a2f5`), ombre portée douce.
- **Biseau des lettres :** éclairage spéculaire (filtre SVG), profondeur de 14 couches (indigo `#0b0836 → #241f8c`, turquoise `#031a19 → #0b5c57`).
- **Ombre au sol :** ellipse floue sous l'icône.

Dans l'interface (boutons, cartes), rester **plat** : les effets 3D sont réservés au logo.

## 6. Mouvement

- L'icône **flotte** : montée de 4 px en 3,4 s, courbe `ease-in-out`, en boucle ; l'ombre au sol se resserre quand l'icône monte.
- `prefers-reduced-motion: reduce` coupe toute animation.
- Pas d'autre animation décorative. Les retours d'état (copie réussie, chargement) restent discrets.

## 7. Ton et rédaction

- Français, **vouvoiement**, phrases courtes, verbes d'action (« Copier le bloc », « Proposer des profils »).
- Dans les mailings : **prénom seul**. Jamais de nom de famille, d'adresse, de téléphone ni d'employeur.
- Message d'erreur : dire ce qui s'est passé et quoi faire (« Trop de demandes. Réessayez dans quelques minutes. »).
- L'IA est présentée comme un assistant : toute fiche porte la mention « à relire avant envoi ».
- Le produit doit pouvoir se traduire : textes d'interface regroupés, pas de jeu de mots intraduisible.

## 8. Bloc de mailing (ce que reçoit l'entreprise)

- Tableau à 4 colonnes : **Poste · Candidat · Profil · Disponibilité**, en-tête sur fond `#eef1f3`, bordures `#d0d5da`.
- Le prénom est un lien vers la fiche CV résumée : gras, couleur `#4338ca`.
- Disponibilité : pastille verte (immédiate) ou ambre (à confirmer) **suivie du texte** ; mention « Contrôle de référence » quand elle est faite.
- Police : Calibri, repli Arial, 14 px. Le bloc n'utilise **que des styles en ligne** et aucune image : il reste lisible avec les images bloquées et se colle proprement dans une messagerie.
- À prévoir : un pied de bloc avec les coordonnées de l'organisation et la mention de confidentialité (pas encore dans le prototype). Le bloc doit pouvoir porter le **logo de l'organisation cliente de CVlink** (marque blanche), pas seulement celui de CVlink.

## 9. Accessibilité (objectifs)

- Contraste AA minimum sur tous les textes.
- Anneau de focus de 2 px `--accent`, décalé de 2 px, sur tous les éléments interactifs.
- Texte alternatif sur le logo (`aria-label="CVlink"`).
- L'information ne passe jamais par la couleur seule : la disponibilité s'écrit en toutes lettres.
- Mise en page en une colonne sur téléphone, sans défilement horizontal de la page.

Un audit d'accessibilité complet (lecteur d'écran, clavier) reste à faire avant tout déploiement réel.

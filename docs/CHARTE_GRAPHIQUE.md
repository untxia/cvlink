# Charte graphique CVlink — v1.0

Cette charte décrit l'identité visuelle de **CVlink** : logo, couleurs, typographie, effets, mouvement, ton et mise en page du bloc de mailing. Les valeurs de référence sont dans [`assets/tokens.css`](../assets/tokens.css).

> **Statut.** Identité proposée pour le prototype. L'inspiration vient de l'univers de Work 2000 (losange bleu, marine, petit losange orange) sans reprendre son logo. Avant tout usage officiel, la direction de Work 2000 doit valider la parenté visuelle, et on remplacera les couleurs estimées par ses codes officiels s'ils existent.

## 1. Idée de marque

- **Nom :** CVlink. « CV » dit le contenu, « link » dit le geste : un nom cliquable qui ouvre le CV.
- **Promesse :** *le bon profil, au bon endroit.*
- **Personnalité :** fiable, rapide, humaine. Un outil de recruteur : pas de décor inutile, de la clarté.

## 2. Logo

| Fichier | Usage |
|---|---|
| `assets/logo.svg` | Logo complet animé (l'icône flotte). Web et application. |
| `assets/logo-static.svg` | Logo complet fixe. Documents, impression, e-mails. |
| `assets/logo.png` | Logo complet fixe, fond transparent. Outlook, Word, présentations. |
| `assets/logo-icon.svg` / `logo-icon-static.svg` / `logo-icon.png` | Icône seule (losange + maillon). Favicon, avatar, application mobile. |

**Construction.** Un losange en verre bleu, épais, avec un maillon de chaîne chromé ; le mot-symbole « CV · LINK » en lettres capitales à coins coupés, extrudées en 3D avec un biseau brillant ; un petit losange orange en séparateur, comme repère de la famille Work 2000.

**Zone de protection.** Laisser autour du logo un espace libre au moins égal à la hauteur d'une lettre.

**Taille minimale.** Logo complet : 120 px de large (ou 30 mm en impression). Icône seule : 24 px (utiliser `logo-icon-static.svg`).

**Fonds.**
- Fond clair : mot-symbole marine `#232a6b`.
- Fond sombre : mot-symbole clair `#e8eef3` (c'est ce que fait déjà la page via `--wordmark`).
- Éviter les fonds photo chargés. Si besoin, poser le logo sur une pastille blanche.

**À ne pas faire.** Étirer ou incliner le logo ; changer les couleurs du losange ; retirer l'extrusion des lettres ; mettre l'orange sur du texte ; ajouter un contour ou une ombre supplémentaire ; animer l'icône dans un e-mail (Outlook ne lit pas l'animation, utiliser la version fixe).

## 3. Couleurs

### Marque

| Nom | Hex | Usage |
|---|---|---|
| Bleu CVlink | `#2f7fba` | Losange du logo, illustrations. |
| Marine | `#232a6b` | Mot-symbole, titres sur fond clair. |
| Orange | `#d85b15` | Petit losange séparateur, décor. **Jamais pour du texte** (contraste 3,9:1 sur blanc, insuffisant). |

### Interface (thème clair)

| Jeton | Hex | Usage | Contraste |
|---|---|---|---|
| `--accent` | `#1f6aa5` | Liens, boutons, focus | 5,7:1 sur blanc |
| `--ink` | `#17232e` | Texte principal | 14,1:1 sur `--bg` |
| `--muted` | `#5a6877` | Texte secondaire | 5,7:1 sur blanc |
| `--bg` | `#eef1f3` | Fond de page | — |
| `--surface` | `#ffffff` | Cartes, panneaux | — |
| `--line` | `#d5dce2` | Filets, bordures | — |
| `--accent-soft` | `#dcebf7` | Ligne sélectionnée, fonds doux | — |
| `--ok` / `--warn` | `#1a7f4b` / `#9a5b00` | Disponible / à confirmer | 5,0:1 / 5,4:1 |
| `--demo` | `#b42318` | Étiquette « Démo · CV fictifs » | 6,6:1 |

### Interface (thème sombre)

| Jeton | Hex | Contraste |
|---|---|---|
| `--bg` | `#0f171e` | — |
| `--surface` | `#17212b` | — |
| `--ink` | `#e8eef3` | 15,5:1 sur `--bg` |
| `--accent` | `#6db4ea` | 8,1:1 sur `--bg` |

Les contrastes ci-dessus respectent le niveau AA des WCAG 2.1 (4,5:1 pour le texte courant). Le thème sombre suit le réglage de l'appareil (`prefers-color-scheme`) et peut être forcé avec `data-theme="dark"` ou `"light"`.

## 4. Typographie

| Rôle | Police | Remarque |
|---|---|---|
| Interface et textes | **IBM Plex Sans** (400, 500, 600) | Lisible, sobre, bon rendu des accents. |
| Données (dates, étiquettes) | **IBM Plex Mono** (400, 500) | Étiquettes en capitales espacées. |
| Titres éditoriaux | **Fraunces** (600) | Réservé aux titres longs ; le logo remplace le titre de page. |

Polices de secours : `system-ui`, `Georgia`, `ui-monospace`. Corps de texte à 14–16 px, interligne confortable ; pas de texte sous 12 px.

Le mot-symbole du logo est **dessiné** (tracés vectoriels), pas écrit avec une police : il ne dépend d'aucune police installée.

## 5. Effets et matières

- **Verre :** dégradé bleu `#58b4f2 → #2f7fba → #1d4f84`, reflet radial en haut à gauche, liseré clair de 1 px.
- **Chrome :** maillon en dégradé blanc → bleu clair (`#ffffff → #cfe3f7 → #7fb0dc`), ombre portée douce.
- **Biseau des lettres :** éclairage spéculaire (filtre SVG) sur les arêtes, profondeur de 14 couches marine `#0b1038 → #1c2680`.
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

## 8. Bloc de mailing (ce que reçoit le recruteur)

- Tableau à 4 colonnes : **Poste · Candidat · Profil · Disponibilité**, en-tête sur fond `#eef1f3`, bordures `#d0d5da`.
- Le prénom est un lien vers la fiche CV résumée : gras, couleur `#1f6aa5`.
- Disponibilité : pastille verte (immédiate) ou ambre (à confirmer) **suivie du texte** ; mention « Contrôle de référence » quand elle est faite.
- Police : Calibri, repli Arial, 14 px. Le bloc n'utilise **que des styles en ligne** et aucune image : il reste lisible avec les images bloquées et se colle proprement dans Outlook.
- À prévoir : un pied de bloc avec les coordonnées de l'agence et la mention de confidentialité (pas encore dans le prototype).

## 9. Accessibilité (objectifs)

- Contraste AA minimum sur tous les textes (tableau ci-dessus).
- Anneau de focus de 2 px `--accent`, décalé de 2 px, sur tous les éléments interactifs.
- Texte alternatif sur le logo (`aria-label="CVlink"`).
- L'information ne passe jamais par la couleur seule : la disponibilité s'écrit en toutes lettres.
- Mise en page en une colonne sur téléphone, sans défilement horizontal de la page.

Un audit d'accessibilité complet (lecteur d'écran, clavier) reste à faire avant tout déploiement réel.

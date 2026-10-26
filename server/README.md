# Serveur CVlink

Socle serveur en TypeScript (étape 2 de la [feuille de route](../docs/FEUILLE_DE_ROUTE.md)).
Ce dossier ne remplace pas le prototype (`app/`) : il contient les briques qui doivent être **sûres avant tout le reste**.

## Ce qui est là

| Fichier | Rôle |
|---|---|
| `src/sanitize.ts` | Nettoyage des CV **par le code** : prénom seul, retrait des téléphones, e-mails, liens, adresses, dates de naissance, lignes sans rapport avec le poste, noms de famille, employeurs et lieux connus. Détection de texte caché et de consignes adressées à une IA. Contrôle de sortie (`findResidualPii`). |
| `src/fiche.ts` | Schéma Zod de la fiche produite par l'assistant. **Rejette** toute fiche qui contient encore une coordonnée ou un nom complet. |
| `src/distance.ts` | Filtre dur : organisation, disponibilité, rayon (haversine). Jamais fait par l'IA. |
| `src/cv/receive.ts` | Réception sûre : type **réel** d'après le contenu (pas l'extension), taille et nombre de pages limités, refus explicites (vide, trop gros, Word, binaire). |
| `src/cv/extract.ts` | Lecture du texte : **PDF avec texte**, **HTML**, **texte/Markdown**. Retire scripts, menus, pieds de page, éléments cachés et texte minuscule, et le signale. Aucun lien n'est suivi. |
| `src/cv/confiance.ts` | Score de confiance de la lecture (0 à 1) ; sous 0,6 le CV part en file de vérification. |
| `src/cv/profil.ts` | Profil canonique (schéma Zod commun à tous les formats). |
| `src/cv/jsonResume.ts` | Import **JSON Resume** sans IA, champs absents laissés vides (jamais inventés). |
| `db/schema.sql` | PostgreSQL + pgvector, cloisonnement par organisation (RLS), journal, liens privés. |
| `tests/` | 94 tests : nettoyage, filtre, fiche, lecture des 6 PDF fictifs du dépôt, PDF et HTML piégés générés à la volée. |

## Lancer

```bash
cd server
npm install
npm run typecheck
npm test
```

## Limites connues (à lire avant d'aller plus loin)

- **Les noms, employeurs et lieux ne se devinent pas.** Le nettoyage retire ceux qu'on lui **fournit** (issus de la fiche source ou de l'extraction). Un nom propre absent de ces listes passe. C'est pourquoi la sortie de l'IA est **aussi** validée (`fiche.ts`) et relue par un humain.
- Les motifs (téléphone, adresse, date de naissance…) sont adaptés aux CV **français**. D'autres pays demanderont d'autres motifs.
- Le nettoyage est volontairement prudent : en cas de doute il retire. Des faux positifs sont possibles (une rue citée dans une mission, par exemple) ; la relecture humaine reste obligatoire.
- `db/schema.sql` a été appliqué et vérifié sur **PGlite** (PostgreSQL embarqué avec pgvector) : le schéma passe, le cloisonnement par organisation refuse bien les lectures et écritures croisées, la contrainte « prénom seul » joue. Ce n'est **pas** un serveur PostgreSQL réel : à rejouer sur une base de développement (Supabase UE, par exemple) avant toute donnée réelle, et le rôle de connexion du serveur ne doit pas contourner la sécurité au niveau des lignes (`BYPASSRLS`, superutilisateur).
- Aucune donnée réelle, aucune clé : `.env.example` liste ce qui sera nécessaire plus tard.

### Limites de la lecture des CV

- **Pas d'OCR** : un PDF scanné ou une image est détecté (peu ou pas de texte), marqué « à vérifier » et jamais proposé ; il n'est pas lu.
- **Pas de Word/ODT** : refusés avec un message qui demande un PDF.
- **Texte blanc sur fond blanc non détecté dans les PDF** : la couleur n'est pas exposée par le lecteur. Sont détectés : le texte minuscule, les consignes visibles adressées à une IA, les caractères invisibles. Le texte posé hors de la page n'est pas extrait, mais il n'est pas signalé.
- **Colonnes** : l'ordre de lecture est reconstitué ligne par ligne ; une mise en page en colonnes très marquée est signalée (« à vérifier ») sans être reconstituée.
- **Pas d'antivirus ni d'isolation** à l'entrée (prévus par `docs/FORMATS_CV.md`) : à ajouter avant d'accepter des fichiers venant de l'extérieur. Les PDF sont lus par `pdf.js`, qui a déjà eu des failles : il doit tourner dans un conteneur sans accès au réseau en production.
- Le passage du **texte** au **profil canonique** (PDF, HTML, texte) demande un modèle de langage ; il viendra à l'étape de l'assistant. Seul le JSON Resume est converti sans IA pour l'instant.

## Suite prévue

1. Texte → profil canonique avec un modèle de langage (sortie validée par Zod), puis `sanitize` pour la fiche.
2. Import + géocodage (Base Adresse Nationale) + embeddings.
3. Recherche hybride (mots-clés + sens) puis vérification critère par critère.
4. Jeu de test de 30 à 50 demandes, puis branchement du modèle de langage.

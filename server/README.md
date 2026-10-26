# Serveur CVlink

Socle serveur en TypeScript (étape 2 de la [feuille de route](../docs/FEUILLE_DE_ROUTE.md)).
Ce dossier ne remplace pas le prototype (`app/`) : il contient les briques qui doivent être **sûres avant tout le reste**.

## Ce qui est là

| Fichier | Rôle |
|---|---|
| `src/sanitize.ts` | Nettoyage des CV **par le code** : prénom seul, retrait des téléphones, e-mails, liens, adresses, dates de naissance, lignes sans rapport avec le poste, noms de famille, employeurs et lieux connus. Détection de texte caché et de consignes adressées à une IA. Contrôle de sortie (`findResidualPii`). |
| `src/fiche.ts` | Schéma Zod de la fiche produite par l'assistant. **Rejette** toute fiche qui contient encore une coordonnée ou un nom complet. |
| `src/distance.ts` | Filtre dur : organisation, disponibilité, rayon (haversine). Jamais fait par l'IA. |
| `db/schema.sql` | PostgreSQL + pgvector, cloisonnement par organisation (RLS), journal, liens privés. |
| `tests/` | 60 tests, dont un CV brut fictif complet (`tests/fixtures/`). |

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

## Suite prévue

1. Lecture des CV (PDF texte d'abord) vers un profil unique.
2. Import + géocodage (Base Adresse Nationale) + embeddings.
3. Recherche hybride (mots-clés + sens) puis vérification critère par critère.
4. Jeu de test de 30 à 50 demandes, puis branchement du modèle de langage.

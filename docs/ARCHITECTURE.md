# Architecture

## Vue d'ensemble

| Couche | Rôle | Prototype | Cible |
|---|---|---|---|
| Source | CV PDF et fiches candidats | 6 PDF fictifs | **Tempo** (export) ou dossier du serveur de l'agence |
| Import | Récupérer, extraire le texte, géocoder | — | Script planifié par agence |
| Base | Candidats, texte du CV, coordonnées, disponibilité | Tableau JavaScript dans la page | Base hébergée en UE (PostgreSQL) |
| Filtre | Distance, disponibilité, agence | Fonction JavaScript (`rqEligible`) | Requête SQL / service |
| Assistant IA | Classement et rédaction à partir de fiches nettoyées | `claude.use("sample")` | **Grok (xAI)** depuis le serveur |
| Interface | Recherche, bloc de mailing, fiche CV | Page HTML | Application web protégée par identifiant |
| Envoi | Mailing aux entreprises | Copier/coller vers Outlook | Idem (validation humaine) |

## Flux de données cible

1. **Import** (une fois par nuit et par agence) : un script lit l'export Tempo, extrait le texte des PDF (OCR si le PDF est scanné), **géocode l'adresse** avec la Base Adresse Nationale, stocke **seulement les coordonnées** (pas l'adresse en clair côté assistant).
2. **Demande** : le recruteur saisit le poste, le lieu, la disponibilité.
3. **Filtre dur (code)** : candidats de l'agence dans le rayon (≤ 20 km à vol d'oiseau, trajet réel en option), disponibles.
4. **Nettoyage (code)** : suppression du nom de famille, de l'adresse, du téléphone, de l'e-mail et des noms d'employeurs avant tout envoi à l'IA.
5. **Assistant IA** : reçoit les fiches nettoyées + la demande, renvoie au plus 5 profils classés avec une raison courte (JSON strict, vérifié côté code : identifiants valides, pas de doublon).
6. **Relecture humaine** : le recruteur valide ou change la sélection.
7. **Bloc de mailing** : tableau HTML en styles en ligne, collé dans Outlook. Les liens pointent vers la fiche CV résumée, hébergée en privé.

## Décisions et raisons

- **La distance est calculée par le code, pas par l'IA** : le rayon est une règle absolue, une IA peut se tromper ou être influencée par le texte d'un CV.
- **L'IA ne voit jamais l'identité complète.** Elle reçoit des fiches anonymisées ; le rapprochement avec le candidat réel se fait côté serveur par un identifiant opaque.
- **Clé API côté serveur uniquement.** Jamais dans la page.
- **Les CV sont des données, pas des instructions.** Le texte d'un CV est encadré dans le prompt et traité comme une donnée (défense contre l'injection de prompt).
- **Géocodage une seule fois à l'import**, pas à chaque demande : la recherche reste instantanée et les adresses sortent peu.
- **Liens de CV privés** : jeton long et aléatoire, expiration, accès journalisé. Un lien ne doit jamais contenir le nom de la personne.

## Géocodage et distances

- **Base Adresse Nationale** (`api-adresse.data.gouv.fr`, en cours de migration vers `data.geopf.fr`) : gratuite, officielle, sans clé. À vérifier à la mise en œuvre : endpoint, quotas, conditions d'utilisation.
- **Communes** : `geo.api.gouv.fr` pour le lieu de la mission.
- **Distance** : formule de haversine (à vol d'oiseau). Option : API d'itinéraires (OpenRouteService, OSRM) si le trajet réel doit primer.

## Intégration avec Tempo

Inconnue à ce jour. Voir [`TEMPO_QUESTIONS.md`](TEMPO_QUESTIONS.md). Trois scénarios, du plus simple au plus intégré :

1. **Export de fichiers** (dossier de PDF + CSV de la liste) lu par un script.
2. **Export/API fourni par l'éditeur.**
3. **Accès direct à la base de Tempo** (à éviter sans accord écrit de l'éditeur).

## Environnements

- `app/` : prototype statique.
- Serveur (à créer) : API + import + base ; variables d'environnement pour les clés (`XAI_API_KEY`, `DATABASE_URL`), jamais dans le dépôt.

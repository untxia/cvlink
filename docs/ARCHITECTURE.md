# Architecture

## Vue d'ensemble

| Couche | Rôle | Prototype | Cible |
|---|---|---|---|
| Source | CV (PDF) et fiches candidats | 6 PDF fictifs | Logiciel de candidatures du client, dossier partagé ou import de fichiers |
| Import | Récupérer, extraire le texte, géocoder | — | Connecteurs et script planifié, par organisation |
| Base | Candidats, texte du CV, coordonnées, disponibilité | Tableau JavaScript dans la page | Base hébergée en UE (PostgreSQL), cloisonnée par organisation |
| Filtre | Distance, disponibilité, périmètre | Fonction JavaScript (`rqEligible`) | Requête SQL / service |
| Assistant IA | Classement et rédaction à partir de fiches nettoyées | `claude.use("sample")` | **Grok (xAI)** depuis le serveur |
| Interface | Recherche, bloc de mailing, fiche CV | Page HTML | Application web protégée par identifiant |
| Envoi | Mailing aux entreprises | Copier/coller vers la messagerie | Idem au départ (validation humaine), envoi intégré plus tard |

## Flux de données cible

1. **Import** (planifié, par organisation) : lecture de la source, extraction du texte des PDF (OCR si scanné), **géocodage de l'adresse** avec la Base Adresse Nationale, stockage des **coordonnées** pour la recherche.
2. **Demande** : le recruteur saisit le poste, le lieu, la disponibilité.
3. **Filtre dur (code)** : candidats de l'organisation dans le rayon et disponibles.
4. **Nettoyage (code)** : suppression du nom de famille, de l'adresse, du téléphone, de l'e-mail et des noms d'employeurs avant tout envoi à l'IA.
5. **Assistant IA** : reçoit les fiches nettoyées + la demande, renvoie au plus 5 profils classés avec une raison courte (JSON strict, vérifié par le code : identifiants valides, pas de doublon).
6. **Relecture humaine** : le recruteur valide ou change la sélection.
7. **Bloc de mailing** : tableau HTML en styles en ligne. Les liens pointent vers la fiche CV résumée, hébergée en privé.

## Décisions et raisons

- **La distance est calculée par le code, pas par l'IA** : le rayon est une règle absolue, une IA peut se tromper ou être influencée par le texte d'un CV.
- **L'IA ne voit jamais l'identité complète.** Elle reçoit des fiches anonymisées ; le rapprochement avec le candidat réel se fait côté serveur par un identifiant opaque.
- **Clé API côté serveur uniquement.** Jamais dans la page.
- **Les CV sont des données, pas des instructions.** Le texte d'un CV est encadré dans le prompt et traité comme une donnée (défense contre l'injection de prompt).
- **Géocodage une seule fois à l'import**, pas à chaque demande : recherche instantanée, adresses moins exposées.
- **Liens de CV privés** : jeton long et aléatoire, expiration, accès journalisé. Un lien ne contient jamais le nom de la personne.
- **Multi-organisations dès la conception** : chaque donnée appartient à une organisation ; aucune requête ne traverse deux organisations.

## Géocodage et distances

- **Base Adresse Nationale** (`api-adresse.data.gouv.fr`, en cours de migration vers `data.geopf.fr`) : gratuite, officielle, sans clé. À vérifier à la mise en œuvre : endpoint, quotas, conditions d'utilisation. Couvre la France ; les autres pays demanderont un autre service.
- **Communes** : `geo.api.gouv.fr` pour le lieu de la mission.
- **Distance** : formule de haversine (à vol d'oiseau). Option : API d'itinéraires (OpenRouteService, OSRM) si le trajet réel doit primer.
- **Rayon** : réglable par organisation. Le prototype le plafonne à 20 km.

## Intégrations

Voir [`INTEGRATIONS.md`](INTEGRATIONS.md) : import de fichiers (CSV + PDF) en premier, puis connecteurs vers les logiciels de gestion des candidatures.

## Environnements

- `app/` : prototype statique.
- Serveur (à créer) : API + import + base ; variables d'environnement pour les clés (`XAI_API_KEY`, `DATABASE_URL`), jamais dans le dépôt.

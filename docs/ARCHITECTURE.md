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

1. **Import** (planifié, par organisation) : lecture de la source, **extraction de tout format de CV** vers un profil unique (voir [`FORMATS_CV.md`](FORMATS_CV.md)), **géocodage de l'adresse** avec la Base Adresse Nationale, stockage des **coordonnées** pour la recherche.
2. **Demande** : le recruteur saisit le poste, le lieu, la disponibilité.
3. **Filtre dur (code)** : candidats de l'organisation dans le rayon et disponibles.
4. **Nettoyage (code)** : suppression du nom de famille, de l'adresse, du téléphone, de l'e-mail et des noms d'employeurs avant tout envoi à l'IA.
5. **Assistant IA** : reçoit les fiches nettoyées + la demande, renvoie au plus 5 profils classés avec une raison courte (JSON strict, vérifié par le code : identifiants valides, pas de doublon).
6. **Relecture humaine** : le recruteur valide ou change la sélection.
7. **Bloc de mailing** : tableau HTML en styles en ligne. Les liens pointent vers la fiche CV résumée, hébergée en privé.

## Choix techniques recommandés (à valider par un jeu de test)

| Brique | Choix | Alternative |
|---|---|---|
| Base | **PostgreSQL + pgvector** (hébergement UE, par exemple Supabase) : filtres, recherche par mots-clés et par sens dans une seule base, droits par organisation | Base vectorielle dédiée si le volume l'exige |
| Recherche | **Hybride** (sens + mots-clés) puis reclassement | Recherche par mots-clés seule au départ |
| Embeddings | Modèle **multilingue** auto-hébergé (par exemple BGE-M3) : aucun CV ne sort | Service d'embeddings en UE sous contrat |
| Agent | **Un seul agent à enchaînement fixe** avec 4 outils : chercher, lire un profil, vérifier un critère, rédiger | Cadre d'agents si les besoins grandissent |
| Modèle de langage | **Grok (xAI)** derrière une couche remplaçable, comparé à 1 ou 2 autres (dont un modèle hébergé en Europe) | — |
| Code | Python ou TypeScript simple, sorties validées par schémas (Pydantic, Zod) | — |

Le modèle se choisit sur un **jeu de test** de 30 à 50 demandes avec les profils que des recruteurs auraient retenus. Un modèle moins cher peut extraire les CV ; un modèle plus fort vérifie les critères. Les conditions des fournisseurs et les versions de modèles changent vite : les revérifier au moment du choix.

## Déroulé de l'agent

1. **Comprendre la demande** : critères obligatoires (habilitation, rayon, date) et souhaitables ; question au recruteur s'il manque l'essentiel.
2. **Filtres stricts (code)** : rayon, disponibilité, organisation.
3. **Recherche (RAG)** : une vingtaine de profils par sens + mots-clés, sur les profils nettoyés.
4. **Vérification** : chaque critère noté *oui / non / à confirmer*, avec la phrase du CV qui le prouve.
5. **Proposition** : 5 profils au plus avec la raison, puis bloc de mailing relu par le recruteur.

L'amélioration au fil de l'usage est décrite dans [`APPRENTISSAGE.md`](APPRENTISSAGE.md).

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

<p align="center">
  <img src="assets/logo.png" alt="CVlink" width="420">
</p>

<p align="center"><strong>Le bon profil, au bon endroit.</strong><br>
Le logiciel qui transforme une base de CV en propositions de candidats prêtes à envoyer, préparées par une IA et validées par un recruteur.</p>

---

## Pour qui

Les **sociétés RH**, **cabinets de recrutement**, **agences d'emploi** et **services RH** d'entreprises qui présentent régulièrement des candidats à des clients ou à des managers.

## Le problème

Présenter des candidats prend du temps et se fait mal :

- les CV sont dans un logiciel ou sur un disque, les mails de présentation sont écrits à la main ;
- les liens vers les CV ne fonctionnent que sur le poste de celui qui envoie ;
- chaque CV contient des informations qui ne doivent pas partir chez le client (nom de famille, adresse, téléphone, anciens employeurs) ;
- trouver, parmi des centaines de CV, les bons profils **près du lieu de la mission** relève de la recherche manuelle.

## La solution

1. Le recruteur colle la **demande d'un client** : poste, lieu, disponibilité.
2. Un **filtre de distance** (calculé par le code, pas par l'IA) garde les candidats du secteur.
3. L'**assistant IA** propose les profils qui conviennent : même métier, ou compétences qui permettent de tenir le poste, avec la raison de chaque choix.
4. Le recruteur **relit**, ajuste, et copie le **bloc de mailing** dans sa messagerie.
5. Chaque prénom du mailing ouvre une **fiche CV résumée** : ce que la personne a fait, pas qui elle est ni où elle a travaillé.

### Règles d'affichage (non négociables)

- **Prénom seul** : jamais de nom de famille.
- **Pas de téléphone, d'adresse, d'e-mail ni de date de naissance.**
- **Pas de nom d'employeur** : on garde les postes, missions et habilitations, pas les entreprises.
- Aucune information sans rapport avec le poste (âge, situation familiale, santé, origine…).
- **Un humain relit toujours** avant l'envoi.

## État du projet

**Prototype de démonstration** avec 6 CV **fictifs**. Aucune donnée réelle, aucune connexion à un logiciel de gestion.

| Fonction | État |
|---|---|
| Liste de candidats, recherche, filtre par poste | Prototype |
| Bloc de mailing copiable dans une messagerie (tableau HTML) | Prototype |
| Fiche CV résumée au clic sur un prénom | Prototype |
| Assistant : préparer la fiche d'un candidat depuis un CV brut | Prototype (via l'IA de Claude) |
| Assistant : répondre à une demande, filtre de distance (20 km maximum dans le prototype) | Prototype (via l'IA de Claude) |
| Import des CV depuis un logiciel de gestion (fichiers, export, API) | À faire — voir [intégrations](docs/INTEGRATIONS.md) |
| Géocodage des adresses (Base Adresse Nationale) | À faire |
| Serveur avec l'API Grok (xAI) | À faire |
| Comptes, organisations, liens de fiches privés | À faire |
| Validation RGPD | À faire avant toute donnée réelle |

Détail dans la [feuille de route](docs/FEUILLE_DE_ROUTE.md).

## Essayer le prototype

Ouvrir [`app/index.html`](app/index.html) dans un navigateur : la liste, la recherche, le bloc de mailing, la copie et la fiche CV fonctionnent hors ligne (seules les polices Google nécessitent Internet).

> **L'assistant IA** du prototype utilise la capacité d'IA intégrée aux pages publiées dans Claude (`claude.use("sample")`). Hors de Claude, l'assistant signale qu'il n'est pas disponible. La version réelle appellera un serveur (voir [architecture](docs/ARCHITECTURE.md)).

Un serveur statique local convient aussi :

```bash
cd app && python3 -m http.server 8080
# puis http://localhost:8080
```

## Structure du dépôt

```
CVLink/
├── app/                      Prototype (page HTML autonome)
│   ├── index.html
│   └── cv/                   6 CV fictifs en PDF (noms de fichiers opaques)
├── assets/                   Logo, icône, jetons de design (tokens.css)
├── docs/
│   ├── CHARTE_GRAPHIQUE.md   Identité visuelle
│   ├── ARCHITECTURE.md       Cible technique et flux de données
│   ├── AGENT_IA.md           Rôle, règles et prompts de l'assistant
│   ├── RGPD.md               Données personnelles, risques, mesures
│   ├── INTEGRATIONS.md       Brancher CVlink aux logiciels de candidatures
│   └── FEUILLE_DE_ROUTE.md   Étapes
├── skills/
│   └── preparation-cv-mailing/SKILL.md   Règles de l'assistant, réutilisables
├── .github/                  Modèles d'issue et de pull request
└── CHANGELOG.md  CONTRIBUTING.md  SECURITY.md  LICENSE
```

## Architecture cible (résumé)

```
Source des CV (logiciel de candidatures, dossier, import de fichiers)
   │  import planifié ou connecteur
   ▼
Base CVlink (texte des CV + coordonnées géocodées, hébergée en UE)
   │
   ├─ filtre de distance, de disponibilité, d'organisation   ← code, pas IA
   ▼
Assistant IA (API Grok, appelée depuis le serveur)
   │  reçoit des fiches nettoyées, renvoie classement + raisons
   ▼
Recruteur : relit, ajuste, copie le bloc  →  envoi depuis sa messagerie
```

Principe : **le code fait les contrôles stricts** (distance, anonymisation, droits d'accès) ; **l'IA classe et rédige** à partir de fiches déjà nettoyées.

## Données et confidentialité

Les CV réels sont des données personnelles. **Aucun CV réel ne doit entrer dans ce dépôt** (voir `.gitignore`). Lire [`docs/RGPD.md`](docs/RGPD.md) avant de brancher la moindre donnée.

## Contribuer

Voir [`CONTRIBUTING.md`](CONTRIBUTING.md). Pour signaler un problème de sécurité ou de données : [`SECURITY.md`](SECURITY.md).

## Licence

Projet propriétaire, tous droits réservés — voir [`LICENSE`](LICENSE).

## Auteur

Christophe Datcharry · [@untxia](https://github.com/untxia)

<p align="center">
  <img src="assets/logo.png" alt="CVlink" width="420">
</p>

<p align="center"><strong>Le bon profil, au bon endroit.</strong><br>
Des mailings de candidats où chaque prénom ouvre une fiche CV, préparés par un assistant IA.</p>

---

## Le problème

Les agences d'intérim **Work 2000** envoient aux entreprises des mailings « Sélection exclusive de profils ». Les noms des candidats y pointent vers des CV rangés sur **le disque local d'un poste** : le destinataire ne peut pas les ouvrir. Les CV sont en PDF dans **Tempo** (le logiciel de gestion), transférés depuis le disque du serveur de l'agence.

## La solution

**CVlink** relie le mailing aux CV :

1. Le recruteur colle la **demande d'un client** (poste, lieu, disponibilité).
2. L'**assistant IA** cherche dans la base de CV les candidats qui conviennent : même métier, ou compétences qui permettent de tenir le poste, **dans un rayon de 20 km maximum**.
3. Il propose 5 profils au plus, avec la raison de chaque choix, et prépare le **bloc de mailing**.
4. Le recruteur relit, copie le bloc dans Outlook et l'envoie. **Chaque prénom ouvre une fiche CV résumée.**

### Règles d'affichage (non négociables)

- **Prénom seul** : jamais de nom de famille.
- **Pas de téléphone, d'adresse, d'e-mail ni de date de naissance.**
- **Pas de nom d'employeur** : on garde ce que la personne a fait (postes, missions, habilitations), pas où.
- Aucune information sans rapport avec le poste (âge, situation familiale, santé, origine…).
- **Un humain relit toujours** avant l'envoi.

## État du projet

**Prototype de démonstration** avec 6 CV **fictifs**. Aucune donnée réelle, aucun accès à Tempo pour l'instant.

| Fonction | État |
|---|---|
| Liste de candidats, recherche, filtre par poste | Prototype |
| Bloc de mailing copiable dans Outlook (tableau HTML) | Prototype |
| Fiche CV résumée au clic sur un prénom (prénom seul, sans employeur) | Prototype |
| Assistant : préparer la fiche d'un candidat depuis un CV brut | Prototype (via l'IA de Claude) |
| Assistant : répondre à une demande de recruteur, filtre de distance ≤ 20 km | Prototype (via l'IA de Claude) |
| Connexion à Tempo / import automatique des CV | À faire — dépend de ce que Tempo peut exporter |
| Géocodage des adresses (Base Adresse Nationale) | À faire |
| Serveur avec l'API Grok (xAI) | À faire |
| Hébergement privé des liens CV pour des destinataires externes | À faire |
| Validation RGPD | À faire avant toute donnée réelle |

Détail dans la [feuille de route](docs/FEUILLE_DE_ROUTE.md).

## Essayer le prototype

Ouvrir [`app/index.html`](app/index.html) dans un navigateur : la liste, la recherche, le bloc de mailing, la copie vers Outlook et la fiche CV fonctionnent hors ligne (seules les polices Google nécessitent Internet).

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
│   ├── TEMPO_QUESTIONS.md    Questions à poser à l'éditeur de Tempo
│   └── FEUILLE_DE_ROUTE.md   Étapes
├── skills/
│   └── preparation-cv-mailing/SKILL.md   Règles de l'assistant, réutilisables
├── .github/                  Modèles d'issue et de pull request
├── CHANGELOG.md  CONTRIBUTING.md  SECURITY.md  LICENSE
```

## Architecture cible (résumé)

```
Tempo / serveur de l'agence
   │  export automatique (script planifié, par agence)
   ▼
Base CVlink (texte des CV + adresse géocodée, hébergée en UE)
   │
   ├─ filtre de distance (≤ 20 km) et de disponibilité   ← code, pas IA
   ▼
Assistant IA (API Grok, appelée depuis le serveur)
   │  reçoit des fiches nettoyées, renvoie classement + raisons
   ▼
Recruteur : relit, ajuste, copie le bloc  →  envoi depuis Outlook
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

# Données personnelles (RGPD)

> Ce document est une **analyse de départ**, pas un avis juridique. Il doit être revu par le **DPO / le responsable juridique de Work 2000** avant tout traitement de données réelles.

## Données concernées

Un CV contient : identité, coordonnées, adresse, parcours, parfois âge, photo, situation familiale, permis, santé (rarement). Ce sont des **données personnelles**, et certaines peuvent être sensibles.

## Ce que CVlink fait avec

| Traitement | Données | Qui voit quoi |
|---|---|---|
| Import depuis Tempo | CV complet | Serveur CVlink uniquement |
| Géocodage | Adresse → coordonnées | Service de géocodage ; seules les coordonnées sont conservées pour la recherche |
| Assistant IA | **Fiche nettoyée** (sans nom, adresse, téléphone, e-mail, employeurs) | Prestataire d'IA |
| Mailing | Prénom, poste, expérience, disponibilité + lien vers une fiche résumée | Entreprise cliente destinataire |

## Principes appliqués

- **Minimisation.** Le destinataire ne voit que le prénom et un résumé du parcours. L'IA ne reçoit pas l'identité.
- **Limitation de la finalité.** Les CV servent à proposer des candidats à des clients de l'agence, rien d'autre.
- **Intervention humaine.** L'IA **propose**, un recruteur **décide** et envoie. Aucune décision automatisée n'est prise sur une personne.
- **Non-discrimination.** L'IA n'utilise que des critères professionnels ; âge, sexe, origine, situation familiale, santé et lieu de vie sont exclus de la sélection (le rayon kilométrique est un critère opérationnel fixé par le client et l'agence).
- **Sécurité.** Hébergement en UE, accès par identifiant, liens de CV à jeton aléatoire, journal d'accès, clés API hors du dépôt.

## Points à valider avant la mise en service

1. **Base légale** et information des candidats : mention dans le dossier d'inscription que le profil peut être présenté à des entreprises clientes sous forme résumée (prénom seul, sans coordonnées). Vérifier si un **consentement** est requis pour une présentation sous forme de lien.
2. **Prestataire d'IA** (Grok / xAI) : contrat de traitement (DPA), pas d'entraînement sur les données, lieu de traitement, durée de conservation, transferts hors UE. Si les garanties manquent, retirer l'IA du traitement des CV complets ou changer de prestataire.
3. **Analyse d'impact (AIPD)** : à envisager, le traitement automatisé de profils de candidats étant un cas à risque.
4. **Durée de conservation** des CV et des liens de fiche (expiration automatique).
5. **Droits des personnes** : accès, rectification, effacement, opposition — prévoir la suppression d'un candidat de la base et des liens actifs.
6. **Registre des traitements** à compléter.
7. **Éditeur de Tempo** : vérifier que l'export de données est autorisé par le contrat.
8. **Photo, âge, situation familiale** présents dans les CV : ne jamais les afficher ; envisager de ne pas les importer.

## Dans ce dépôt

- Aucun CV réel. Les 6 CV de `app/cv/` sont fictifs ; leurs noms de fichiers sont des identifiants opaques.
- `.gitignore` bloque les dossiers de données réelles (`data/`, `exports/`, `cv-reels/`, `*.csv`, `.env`).
- En cas de fuite de données dans un commit : voir [`SECURITY.md`](../SECURITY.md).

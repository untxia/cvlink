# Feuille de route

## Étape 0 — Prototype ✅
- Page autonome : liste, recherche, bloc de mailing, copie vers Outlook, fiche CV résumée (prénom seul, sans employeur).
- Assistant IA : fiche depuis un CV brut ; réponse à une demande de recruteur avec filtre de distance (≤ 20 km).
- Identité visuelle (logo 3D, charte).

## Étape 1 — Cadrage (avant d'écrire du code de production)
- [ ] Obtenir les réponses de [`TEMPO_QUESTIONS.md`](TEMPO_QUESTIONS.md).
- [ ] Obtenir **un export réel** d'**une seule agence** (pilote).
- [ ] Validation RGPD par Work 2000 ([`RGPD.md`](RGPD.md)).
- [ ] Validation de la parenté visuelle avec Work 2000, codes couleur officiels.

## Étape 2 — Serveur et import
- [ ] Choisir l'hébergement (UE) et la base.
- [ ] Script d'import : lecture de l'export, extraction du texte (OCR si besoin), géocodage (Base Adresse Nationale).
- [ ] Nettoyage automatique (nom, adresse, téléphone, e-mail, employeurs) avec tests.
- [ ] Connexion de l'interface à la base à la place des données du prototype.

## Étape 3 — Assistant avec Grok
- [ ] Serveur : appel à l'API de xAI, clé en variable d'environnement.
- [ ] DPA et garanties de non-entraînement signés.
- [ ] Jeu de test et évaluation (zéro fuite d'identité, zéro sortie du rayon).
- [ ] Journalisation des demandes (sans CV complet).

## Étape 4 — Mise en service pilote
- [ ] Authentification des recruteurs.
- [ ] Liens de fiches privés, avec expiration, pour les destinataires externes.
- [ ] Pied de bloc de mailing (coordonnées de l'agence, confidentialité).
- [ ] Formation courte des recruteurs de l'agence pilote.

## Étape 5 — Déploiement par agence
- [ ] Répéter l'import et la validation, agence par agence.
- [ ] Retours des recruteurs, ajustement des règles de sélection.

## Idées pour plus tard
- Trajet réel par la route (API d'itinéraires) au lieu du vol d'oiseau.
- Rayon réglable par type de poste, dans la limite fixée par l'agence.
- Mémoriser les demandes récurrentes des clients.
- Statistiques : demandes traitées, profils proposés, entretiens obtenus.

# Feuille de route

## Étape 0 — Prototype ✅
- Page autonome : liste, recherche, bloc de mailing, copie vers une messagerie, fiche CV résumée (prénom seul, sans employeur).
- Assistant IA : fiche depuis un CV brut ; réponse à une demande de recruteur avec filtre de distance.
- Identité visuelle (logo 3D, charte v2.0).

## Étape 1 — Cadrage produit
- [ ] Choisir le premier segment visé (agences d'intérim, cabinets de recrutement, RH d'entreprise) et interroger 5 à 10 recruteurs de ce segment.
- [ ] Définir l'offre : qui paie, quoi, à quel prix.
- [ ] Choisir le nom commercial définitif et vérifier sa disponibilité (marque, domaine, réseaux).
- [ ] Trouver un **premier client pilote** et un **export réel** (voir [`INTEGRATIONS.md`](INTEGRATIONS.md)).
- [ ] Revue RGPD ([`RGPD.md`](RGPD.md)) : rôles, contrat de sous-traitance, prestataire d'IA.

## Étape 2 — Socle serveur
(Les formats de CV à lire, et l'ordre de mise en œuvre, sont dans [`FORMATS_CV.md`](FORMATS_CV.md).)
- [ ] Hébergement UE, base PostgreSQL, cloisonnement par organisation.
- [ ] Authentification, rôles (administrateur, recruteur).
- [ ] Lecture des CV : PDF texte, texte, Markdown, HTML, puis Word et OCR (scans, images), puis JSON Resume, Europass et exports d'ATS, puis pages web et CV interactifs.
- [ ] Profil canonique, score de confiance, file de vérification, détection de texte caché.
- [ ] Import de fichiers (CSV + PDF), géocodage (Base Adresse Nationale).
- [ ] Nettoyage automatique (nom, adresse, téléphone, e-mail, employeurs) avec tests.
- [ ] Interface connectée à la base à la place des données du prototype.

## Étape 3 — Assistant avec Grok
- [ ] Serveur : appel à l'API de xAI, clé en variable d'environnement.
- [ ] Contrat de traitement (DPA) et garanties de non-entraînement.
- [ ] Jeu de test et évaluation (zéro fuite d'identité, zéro sortie du rayon, zéro mélange entre organisations).
- [ ] Journalisation des demandes (sans CV complet).

## Étape 4 — Pilote
- [ ] Liens de fiches privés, avec expiration, pour les destinataires externes.
- [ ] Marque blanche : logo et coordonnées de l'organisation dans le bloc de mailing.
- [ ] Pied de bloc : confidentialité et désinscription.
- [ ] Formation courte des recruteurs du client pilote.

## Étape 5 — Ouverture
- [ ] Connecteurs vers les logiciels de gestion les plus utilisés.
- [ ] Envoi intégré (en plus du copier/coller), avec suivi des ouvertures de fiches.
- [ ] Tarification, facturation, documentation d'aide.

## Idées pour plus tard
- Trajet réel par la route au lieu du vol d'oiseau ; autres pays que la France.
- Rayon réglable par type de poste.
- Mémoriser les demandes récurrentes des clients.
- Statistiques : demandes traitées, profils proposés, entretiens obtenus.
- Application mobile pour les recruteurs.

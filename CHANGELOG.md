# Journal des modifications

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Versionnage : [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté
- `docs/APPRENTISSAGE.md` : apprentissage par société (base, glossaire, fiches clients, journal d'événements), étanchéité, biais, mesure.
- Choix techniques recommandés et déroulé de l'agent dans `docs/ARCHITECTURE.md`.
- `docs/FORMATS_CV.md` : lecture de tous les formats de CV (PDF, scans, Word, HTML, CV interactifs, exports d'ATS), profil canonique, sécurité à l'entrée.

### Modifié
- CVlink devient un produit indépendant destiné aux sociétés RH, cabinets de recrutement et agences d'emploi.
- Nouvelle identité visuelle (charte v2.0) : tuile indigo, « CV » indigo, « LINK » turquoise.
- Textes et documentation rendus génériques (plus de référence à un client ou un logiciel précis).
- Guide des intégrations (`docs/INTEGRATIONS.md`) à la place des questions propres à un logiciel.

## [0.1.0] — 2026-10-26

Premier dépôt : prototype de démonstration avec CV fictifs.

### Ajouté
- Page autonome `app/index.html` : liste de candidats, recherche, filtre par poste, bloc de mailing (Poste · Candidat · Profil · Disponibilité) copiable dans Outlook.
- Fiche CV résumée au clic sur un prénom : prénom seul, sans coordonnées ni employeurs.
- 6 CV fictifs en PDF (`app/cv/`), noms de fichiers opaques.
- Assistant IA « préparer un candidat » : fiche anonymisée depuis un CV brut, détection de numéros et d'e-mails oubliés.
- Assistant IA « demande de recruteur » : sélection de 5 profils au plus, rayon de 20 km maximum calculé par le code.
- Identité visuelle : logo 3D (icône flottante animée), jetons de design, charte graphique.
- Documentation : architecture, assistant IA, RGPD, intégrations, feuille de route.

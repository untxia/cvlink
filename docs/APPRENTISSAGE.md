# Apprentissage par organisation

Objectif : CVlink s'améliore avec l'usage **dans chaque société qui l'utilise** (ses CV, ses métiers, ses clients, ses habitudes), sans jamais mélanger les données de deux sociétés.

## Principe : apprendre par les données, pas en réentraînant le modèle

On ne modifie pas le modèle d'IA. Il apprend à travers ce qui l'entoure : la base de CV de la société, ses retours, ses réglages et ses exemples. C'est plus rapide, moins cher, auditable, et **effaçable** : on peut retirer un candidat de la base alors qu'on ne peut pas le « désapprendre » des poids d'un modèle réentraîné (point RGPD majeur).

## Ce qui est appris, et comment

| Ce qui s'améliore | Source du signal | Mécanisme |
|---|---|---|
| **La base de CV** | Chaque CV reçu ou importé | Extraction vers le profil unique, indexation (RAG). Plus la base grandit, plus les propositions sont riches. |
| **Le vocabulaire du métier** | Les CV et les demandes de la société | Glossaire par société : « cariste » = « conducteur d'engins de manutention » ; habilitations équivalentes ; abréviations internes. Proposé par l'IA, **validé par un humain**. |
| **Les préférences des clients** | Demandes passées d'un même client | Fiche client : exigences récurrentes (équipe du matin, CACES 5 obligatoire, profils juniors acceptés). |
| **Le classement des profils** | Ce que le recruteur garde, retire, ajoute, envoie | Journal des événements (voir ci-dessous) ; poids du classement recalculés par société (modèle statistique simple, quelques dizaines d'exemples suffisent). |
| **La rédaction** | Textes validés ou corrigés par le recruteur | Exemples de la société réutilisés dans le prompt (apprentissage « par l'exemple », sans entraînement). |
| **Les critères de vérification** | Corrections du recruteur (« non, ce n'est pas équivalent ») | Règles propres à la société, ajoutées au prompt de vérification. |

## Journal des événements (par société)

Chaque étape laisse une trace, sans CV complet :

`demande reçue` → `profils proposés` → `profil gardé / retiré / ajouté à la main` → `bloc envoyé` → `fiche ouverte par le client` → `entretien obtenu` → `candidat placé`.

Les signaux **forts** sont les derniers (entretien, placement) ; les signaux **faibles**, les premiers (gardé ou retiré). On commence par les faibles, car ils arrivent tout de suite.

## Démarrage à froid

Une société qui installe CVlink part d'un **comportement générique** (règles de ce dépôt, modèle d'embeddings multilingue). Avec ses propres CV importés, la recherche est déjà adaptée à son métier. Les retours des recruteurs ajustent ensuite le classement : prévoir une période d'amorçage de quelques semaines d'usage avant de juger l'apprentissage.

## Étanchéité entre sociétés

- **Aucun mélange par défaut** : chaque société a son propre espace (CV, glossaire, clients, journal). Une requête ne traverse jamais deux sociétés.
- Un apprentissage **commun** (par exemple un glossaire général des métiers) n'utilise que des données **non personnelles**, fournies par CVlink, jamais des CV ou des retours d'une société.
- Si un jour on souhaite apprendre de plusieurs sociétés, ce sera **sur option, avec accord écrit**, sur des données agrégées et anonymisées, et jamais sur des CV.

## Risque : reproduire les biais du passé

Apprendre de ce que les recruteurs ont choisi peut **reproduire leurs préjugés** (âge, sexe, origine, lieu d'habitation), y compris par des indices indirects. Garde-fous :

- Les signaux d'apprentissage ne portent que sur des **éléments professionnels** (compétences, habilitations, expérience, disponibilité). Les attributs protégés et leurs indices proches ne servent pas à classer.
- **Audit régulier** : comparer les profils proposés selon des critères non utilisés (âge estimé, sexe supposé du prénom, secteur géographique) et chercher des écarts.
- **Contrôle humain** à chaque étape et **raison citée** pour chaque proposition.
- Possibilité de **désactiver** l'apprentissage ou de **réinitialiser** les poids d'une société.
- Le règlement européen sur l'IA traite les outils de tri de candidats comme des systèmes à haut risque : journal, transparence et supervision humaine font partie du produit. Le calendrier exact est à vérifier avec un juriste.

## Données personnelles

- Le journal d'événements contient des identifiants opaques, pas des identités ; il est supprimé ou anonymisé avec le candidat concerné.
- Les embeddings sont des données personnelles dérivées : ils sont **supprimés avec le profil** à la demande de la personne ou à l'expiration de la conservation.
- Aucun CV n'est envoyé à un prestataire d'IA pour **entraîner** un modèle ; le contrat doit l'interdire (voir [`RGPD.md`](RGPD.md)).

## Plus tard : entraînement de modèles

Réentraîner un modèle (reclassement ou extraction spécialisés) n'a de sens qu'avec **beaucoup de données validées** et un accord clair. À envisager seulement sur des **données non personnelles** ou **synthétiques**, après avoir mesuré ce que l'apprentissage par les données n'apporte pas.

## Comment mesurer que ça progresse

Par société, mois après mois :
- **taux de profils gardés** parmi ceux proposés ;
- **nombre de corrections manuelles** par demande ;
- **délai** entre la demande et l'envoi du mailing ;
- **entretiens et placements** par mailing ;
- **zéro** fuite d'identité et **zéro** mélange entre sociétés (tests permanents).

Comparer toujours à un **groupe de référence** (même demande traitée sans apprentissage) avant d'affirmer qu'une amélioration vient de l'apprentissage.

# Assistant IA

Deux missions, un même garde-fou : **ne jamais montrer ce qui identifie ou contacte la personne, et laisser un humain valider.**

## 1. Préparer la fiche d'un candidat

**Entrée :** texte brut d'un CV (+ besoin du client, facultatif).
**Sortie :** JSON

```json
{
  "prenom": "", "poste": "", "annees_experience": 0,
  "dispo": "Immédiate | Sous 1 semaine | Sous 2 semaines | À confirmer",
  "competences": ["3 à 4 éléments"],
  "points_forts": "une phrase de 20 mots maximum",
  "experiences": [["dates", "intitulé sans employeur", "missions"]],
  "alerte": null
}
```

**Interdit dans la sortie :** nom de famille, adresse, ville, code postal, téléphone, e-mail, date de naissance, âge, nationalité, situation familiale, photo, santé ou handicap, noms d'employeurs.

Après la réponse, le code **assainit** la fiche : bornes de longueur, valeurs de `dispo` limitées à la liste, et **détection par expressions régulières** de numéros de téléphone français et d'e-mails restés dans le texte (ils déclenchent l'alerte « à retirer avant envoi »).

## 2. Répondre à une demande de recruteur

**Entrée :** demande en texte libre + lieu + rayon (réglable ; plafonné à 20 km dans le prototype).
**Étapes :**

1. Le **code** filtre les candidats du rayon et de l'organisation (jamais l'IA).
2. L'IA reçoit uniquement ces fiches nettoyées.
3. Elle propose **5 profils au plus**, du plus au moins adapté, avec `adequation` (`Forte` / `Possible`) et une `raison` d'une phrase.
4. Le **code** vérifie que chaque identifiant renvoyé existe dans la liste examinée, supprime les doublons, limite à 5.
5. Le recruteur décide de les mettre dans le bloc de mailing.

**Règles de sélection :**
- Même métier **ou** compétences/expériences qui permettent clairement de tenir le poste.
- Tenir compte de la disponibilité et des habilitations (CACES, SST, habilitation électrique…).
- **Critères professionnels uniquement** : jamais âge, sexe, origine, situation familiale, santé, lieu de vie.
- Zéro résultat est une réponse acceptable.

## Sécurité du prompt

- Le texte du CV et la demande sont encadrés (`<cv>…</cv>`, `<demande>…</demande>`, `<candidats>…</candidats>`) et déclarés comme **données**.
- La réponse est du JSON strict, validé côté code ; toute réponse invalide est rejetée.
- Aucune action n'est déclenchée par l'IA (pas d'envoi d'e-mail, pas d'écriture dans le logiciel source des CV).

## Passage à Grok (xAI)

Le format d'entrée et de sortie ne change pas. Seul l'appel change : au lieu de `claude.use("sample")`, le serveur appelle l'API de xAI (format compatible avec l'API OpenAI, à confirmer dans leur documentation, ainsi que le nom du modèle).

À obtenir **avant** d'envoyer de vrais CV : contrat de traitement des données (DPA), engagement de non-entraînement sur les données, lieu de traitement, durée de conservation. Voir [`RGPD.md`](RGPD.md).

## Évaluation

Avant la mise en service, constituer un **jeu de test** (CV fictifs + demandes) et mesurer :
- l'absence de fuite d'identité dans les fiches (zéro toléré) ;
- le respect du rayon et du cloisonnement entre organisations (zéro toléré) ;
- la pertinence des profils proposés, jugée par deux recruteurs.

Les règles de l'assistant sont aussi décrites dans [`skills/preparation-cv-mailing/SKILL.md`](../skills/preparation-cv-mailing/SKILL.md).

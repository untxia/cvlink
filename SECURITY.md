# Sécurité et données

## Signaler un problème

Contacter l'auteur **en privé** (pas d'issue publique) : [@untxia](https://github.com/untxia). Indiquer ce qui a été vu, où, et comment le reproduire. Ne pas joindre de données personnelles réelles.

## Si des données réelles ont été versées par erreur

1. **Ne pas** simplement supprimer le fichier dans un nouveau commit : il reste dans l'historique.
2. Prévenir immédiatement l'auteur et le responsable RGPD de Work 2000.
3. Purger l'historique (`git filter-repo`), forcer la mise à jour, et demander à GitHub de supprimer les références en cache si le dépôt a été public.
4. Évaluer s'il s'agit d'une violation de données à notifier (CNIL, 72 h).

## Bonnes pratiques

- Dépôt **privé** tant qu'aucune décision contraire n'est prise.
- Clés d'API uniquement côté serveur, en variables d'environnement.
- Liens de CV : jeton aléatoire long, expiration, journal d'accès.
- Dépendances : mises à jour régulières une fois le serveur créé.

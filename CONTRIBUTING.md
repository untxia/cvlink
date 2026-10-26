# Contribuer à CVlink

## Règles d'or

1. **Aucune donnée réelle dans le dépôt.** Ni CV, ni export de Tempo, ni capture d'écran avec de vrais noms. Utiliser les CV fictifs de `app/cv/`.
2. **Aucun secret dans le dépôt** (clés d'API, mots de passe, jetons). Utiliser des variables d'environnement ; fournir un `.env.example` sans valeurs.
3. **Les règles d'affichage sont non négociables** : prénom seul, pas de coordonnées, pas d'employeur ([README](README.md)).
4. **Le code fait les contrôles stricts** (distance, anonymisation, droits) ; **l'IA classe et rédige**.

## Flux de travail

- Branche `main` : toujours dans un état présentable.
- Une branche par sujet : `feat/…`, `fix/…`, `docs/…`.
- Pull request relue avant fusion (voir le modèle).
- Messages de commit courts, à l'impératif, en français : « Ajoute le filtre de distance ».

## Avant d'ouvrir une pull request

- [ ] Le prototype s'ouvre sans erreur dans la console du navigateur.
- [ ] Aucun CV réel, aucun secret (relire le diff).
- [ ] Les textes visibles sont en français, au vouvoiement.
- [ ] Si l'identité visuelle change : mettre à jour [`docs/CHARTE_GRAPHIQUE.md`](docs/CHARTE_GRAPHIQUE.md) et `assets/tokens.css`.
- [ ] Si une règle de l'assistant change : mettre à jour [`docs/AGENT_IA.md`](docs/AGENT_IA.md) et la compétence dans `skills/`.
- [ ] `CHANGELOG.md` à jour.

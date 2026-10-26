# Intégrations : brancher CVlink aux CV existants

CVlink doit s'adapter à l'outil où vivent déjà les CV du client : logiciel de gestion d'intérim ou de recrutement (ATS), système RH, dossier partagé.

Les formats de fichiers acceptés (PDF, scans, Word, HTML, CV interactifs, exports d'ATS) sont décrits dans [`FORMATS_CV.md`](FORMATS_CV.md).

## Scénarios, du plus simple au plus intégré

1. **Import de fichiers** (démarrage recommandé) : un dossier de CV en PDF + un fichier CSV listant les candidats (identifiant, poste, compétences, disponibilité, code postal ou adresse). Fonctionne avec n'importe quel logiciel qui sait exporter.
2. **Export planifié** : le logiciel du client dépose chaque nuit un export dans un dossier surveillé par CVlink.
3. **API ou connecteur** : lecture directe via l'API du logiciel (compte en lecture seule). Un connecteur par logiciel.
4. **Accès direct à la base de données du client** : à éviter sans accord écrit de l'éditeur du logiciel.

## Format d'import minimal (proposition)

| Colonne | Obligatoire | Remarque |
|---|---|---|
| `id` | oui | Identifiant stable du candidat chez le client |
| `prenom` | oui | Le nom de famille n'est pas nécessaire à CVlink |
| `poste` | oui | Métier principal |
| `competences` | non | Liste séparée par des `;` (habilitations, permis, outils) |
| `disponibilite` | non | Date ou « immédiate » |
| `code_postal` ou `adresse` | oui pour le filtre de distance | Géocodé à l'import |
| `reference_controlee` | non | `oui` / `non` |
| `fichier_cv` | oui | Nom du PDF associé |

## Questions à poser à un éditeur ou à l'administrateur du logiciel

**Accès aux CV**
1. Existe-t-il une **API** ou un **export programmé** (CSV, XML, JSON) de la liste des candidats ?
2. Où sont stockés les **PDF** : dans la base ou dans un dossier ? Quel format de nom ?
3. Le lien candidat ↔ PDF est-il exportable (identifiant commun) ?
4. Peut-on obtenir un **compte en lecture seule** dédié ?
5. L'export est-il autorisé par le contrat avec l'éditeur ? Y a-t-il un coût ?

**Données utiles à la recherche**
6. Peut-on exporter : poste, compétences et habilitations, disponibilité, adresse ou code postal, rattachement (agence, site), contrôle de référence ?
7. Les CV sont-ils du **texte** ou des **scans** ? Les scans demandent de l'OCR.
8. Existe-t-il un statut « actif / archivé » pour exclure les candidats qui ne cherchent plus ?

**Organisation**
9. Combien de sites ou d'agences, combien de CV par site ?
10. À quelle fréquence la base change-t-elle ?
11. Qui est le référent technique, et qui valide la conformité RGPD ?

**Envoi**
12. Depuis quel outil part le mailing aujourd'hui (messagerie seule ou outil d'envoi) ?

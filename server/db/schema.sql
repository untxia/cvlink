-- CVlink — schéma PostgreSQL (hébergement UE) avec pgvector.
-- Voir docs/ARCHITECTURE.md et docs/APPRENTISSAGE.md.
--
-- Principes :
--  * chaque ligne appartient à UNE organisation ; aucune requête ne traverse deux organisations
--    (cloisonnement renforcé par la sécurité au niveau des lignes, RLS) ;
--  * le CV complet (identité, coordonnées) reste dans `cv_sources`, lisible par le serveur seulement ;
--    l'IA ne voit que `profils.fiche` (déjà nettoyée) ;
--  * le journal ne contient jamais de CV complet ;
--  * tout est effaçable : supprimer un candidat supprime ses sources, profils, liens et vecteurs (CASCADE).
--
-- À appliquer sur une base neuve. NON exécuté dans cet environnement : à tester sur une base de
-- développement avant toute donnée réelle.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Organisations (sociétés clientes) et utilisateurs
-- ---------------------------------------------------------------------------
create table if not exists organisations (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  rayon_max_km integer not null default 20 check (rayon_max_km between 1 and 200),
  cree_le     timestamptz not null default now()
);

create table if not exists utilisateurs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  email           text not null,
  role            text not null check (role in ('administrateur', 'recruteur')),
  cree_le         timestamptz not null default now(),
  unique (organisation_id, email)
);

-- ---------------------------------------------------------------------------
-- Candidats : ce qui sert aux filtres durs (code), jamais à l'IA
-- ---------------------------------------------------------------------------
create table if not exists candidats (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  reference_source text,                       -- identifiant dans le logiciel d'origine
  prenom          text not null check (prenom ~ '^[[:alpha:]][[:alpha:]''’-]*$'),
  latitude        double precision check (latitude  between -90  and 90),
  longitude       double precision check (longitude between -180 and 180),
  disponible      boolean not null default true,
  disponible_le   date,
  cree_le         timestamptz not null default now(),
  mis_a_jour_le   timestamptz not null default now(),
  unique (organisation_id, reference_source)
);
create index if not exists idx_candidats_org on candidats (organisation_id);
create index if not exists idx_candidats_org_dispo on candidats (organisation_id, disponible);

-- ---------------------------------------------------------------------------
-- CV complets : lisibles par le serveur d'import uniquement
-- ---------------------------------------------------------------------------
create table if not exists cv_sources (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  candidat_id     uuid not null references candidats(id) on delete cascade,
  format          text not null,                -- pdf, docx, html, texte, …
  texte_brut      text not null,                -- à chiffrer au repos (clé gérée côté serveur)
  confiance_lecture real check (confiance_lecture between 0 and 1),
  cree_le         timestamptz not null default now()
);
create index if not exists idx_cv_sources_candidat on cv_sources (candidat_id);

-- ---------------------------------------------------------------------------
-- Profils nettoyés : seule matière vue par l'IA
-- ---------------------------------------------------------------------------
create table if not exists profils (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  candidat_id     uuid not null unique references candidats(id) on delete cascade,
  fiche           jsonb not null,               -- validée par FicheSchema (server/src/fiche.ts)
  texte_recherche text  not null,               -- texte nettoyé indexé
  recherche_tsv   tsvector generated always as (to_tsvector('french', texte_recherche)) stored,
  embedding       vector(1024),                 -- modèle multilingue (ex. BGE-M3) ; à ajuster au modèle retenu
  alerte          text,                         -- texte caché, consigne suspecte, lecture douteuse
  verifie         boolean not null default false,  -- vérifié par un humain
  cree_le         timestamptz not null default now()
);
create index if not exists idx_profils_org on profils (organisation_id);
create index if not exists idx_profils_tsv on profils using gin (recherche_tsv);
create index if not exists idx_profils_embedding on profils using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- Liens de fiches privés (jeton aléatoire, expiration, accès journalisés)
-- ---------------------------------------------------------------------------
create table if not exists liens_fiches (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations(id) on delete cascade,
  candidat_id     uuid not null references candidats(id) on delete cascade,
  jeton_hash      text not null unique,          -- on stocke l'empreinte, jamais le jeton
  expire_le       timestamptz not null,
  revoque         boolean not null default false,
  cree_le         timestamptz not null default now()
);
create table if not exists acces_liens (
  id          bigserial primary key,
  lien_id     uuid not null references liens_fiches(id) on delete cascade,
  acces_le    timestamptz not null default now(),
  adresse_ip_hash text
);

-- ---------------------------------------------------------------------------
-- Journal des événements par organisation (apprentissage, audit) — sans CV complet
-- ---------------------------------------------------------------------------
create table if not exists evenements (
  id              bigserial primary key,
  organisation_id uuid not null references organisations(id) on delete cascade,
  utilisateur_id  uuid references utilisateurs(id) on delete set null,
  demande_id      uuid,                          -- regroupe les événements d'une même demande
  type            text not null check (type in (
    'demande_recue', 'profils_proposes', 'profil_garde', 'profil_retire', 'profil_ajoute',
    'bloc_envoye', 'fiche_ouverte', 'entretien_obtenu', 'candidat_place', 'alerte_securite'
  )),
  candidat_id     uuid references candidats(id) on delete set null,
  details         jsonb not null default '{}'::jsonb,   -- jamais de CV complet ni de coordonnées
  cree_le         timestamptz not null default now()
);
create index if not exists idx_evenements_org_type on evenements (organisation_id, type, cree_le desc);

-- ---------------------------------------------------------------------------
-- Cloisonnement par organisation (RLS)
-- Le serveur ouvre chaque transaction avec :
--   select set_config('app.organisation_id', '<uuid>', true);
-- Sans cette valeur, aucune ligne n'est visible.
-- ---------------------------------------------------------------------------
create or replace function app_organisation_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.organisation_id', true), '')::uuid
$$;

do $$
declare
  t text;
begin
  foreach t in array array['utilisateurs', 'candidats', 'cv_sources', 'profils', 'liens_fiches', 'evenements']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format('drop policy if exists cloisonnement on %I', t);
    execute format(
      'create policy cloisonnement on %I using (organisation_id = app_organisation_id()) with check (organisation_id = app_organisation_id())',
      t
    );
  end loop;
end $$;

-- `acces_liens` suit son lien : visible seulement si le lien appartient à l'organisation courante.
alter table acces_liens enable row level security;
alter table acces_liens force row level security;
drop policy if exists cloisonnement on acces_liens;
create policy cloisonnement on acces_liens
  using (exists (select 1 from liens_fiches l where l.id = lien_id and l.organisation_id = app_organisation_id()));

-- IMPORTANT : le serveur doit se connecter avec un rôle SANS droit BYPASSRLS ni propriétaire des tables,
-- sinon le cloisonnement est contourné. `force row level security` couvre le propriétaire, pas les superutilisateurs.

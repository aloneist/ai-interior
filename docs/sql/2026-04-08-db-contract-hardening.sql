-- DB contract hardening for canonical product identity.
-- Scope:
-- - public.furniture_products is the canonical active product table.
-- - public.import_jobs remains staging/review only.
-- - public.furniture is legacy compatibility only and is frozen, not deleted.
-- - recommendations.furniture_id keeps its legacy name but points to canonical product IDs.
-- - furniture_vectors keeps the existing compatibility FK state for now.

begin;

alter table if exists public.furniture_products
  add column if not exists affiliate_url text;

alter table if exists public.furniture_products
  alter column metadata_json set default '{}'::jsonb;

update public.furniture_products
set metadata_json = '{}'::jsonb
where metadata_json is null;

alter table if exists public.furniture_products
  alter column metadata_json set not null;

comment on table public.furniture_products is
  'Canonical active product table for AI interior curation. Active product reads/writes should use this table, not legacy public.furniture.';
comment on column public.furniture_products.product_url is
  'Source product page URL. Keep separate from affiliate_url.';
comment on column public.furniture_products.affiliate_url is
  'Preferred outbound purchase URL when present.';
comment on column public.furniture_products.material is
  'Material only. Dimensions belong only in width_cm, depth_cm, and height_cm. Parser/vision noise is normalized in application code before persistence.';

-- Keep material cleanup in application code. The earlier DB regex checks were
-- too broad for noisy commerce text and could reject legitimate material labels.
alter table if exists public.furniture_products
  drop constraint if exists furniture_products_material_not_dimension_like_check;

alter table if exists public.import_jobs
  add column if not exists published_product_id uuid;

alter table if exists public.import_jobs
  alter column status set default 'pending_review';

comment on table public.import_jobs is
  'Staging/review queue only. Published active products must be written to public.furniture_products.';
comment on column public.import_jobs.published_product_id is
  'Official link from a staging/review row to the canonical public.furniture_products product row.';
comment on column public.import_jobs.status is
  'Review status. Allowed values for this MVP contract are pending_review, published, and rejected.';

do $$
begin
  if to_regclass('public.import_jobs') is not null
    and not exists (
      select 1
      from pg_constraint
      where conrelid = 'public.import_jobs'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%status%'
        and pg_get_constraintdef(oid) ilike '%pending_review%'
        and pg_get_constraintdef(oid) ilike '%published%'
        and pg_get_constraintdef(oid) ilike '%rejected%'
    )
    and not exists (
      select 1
      from pg_constraint
      where conname = 'import_jobs_status_contract_check'
        and conrelid = 'public.import_jobs'::regclass
    )
  then
    alter table public.import_jobs
      add constraint import_jobs_status_contract_check
      check (status is null or status in ('pending_review', 'published', 'rejected'))
      not valid;

    alter table public.import_jobs
      validate constraint import_jobs_status_contract_check;
  end if;
end $$;

alter table if exists public.import_jobs
  drop constraint if exists import_jobs_extracted_material_not_dimension_like_check;

do $$
begin
  if to_regclass('public.import_jobs') is not null
    and to_regclass('public.furniture_products') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'import_jobs_published_product_id_furniture_products_fk'
        and conrelid = 'public.import_jobs'::regclass
    )
  then
    if not exists (
      select 1
      from pg_attribute ij_col
      join pg_attribute fp_col
        on fp_col.attrelid = 'public.furniture_products'::regclass
       and fp_col.attname = 'id'
       and fp_col.attnum > 0
       and not fp_col.attisdropped
      where ij_col.attrelid = 'public.import_jobs'::regclass
        and ij_col.attname = 'published_product_id'
        and ij_col.attnum > 0
        and not ij_col.attisdropped
        and ij_col.atttypid = fp_col.atttypid
    )
    then
      raise notice 'Skipped import_jobs.published_product_id FK: column type does not match furniture_products.id.';
    elsif exists (
      select 1
      from public.import_jobs ij
      left join public.furniture_products fp on fp.id = ij.published_product_id
      where ij.published_product_id is not null
        and fp.id is null
      limit 1
    )
    then
      raise notice 'Skipped import_jobs.published_product_id FK: orphan links exist.';
    else
      alter table public.import_jobs
        add constraint import_jobs_published_product_id_furniture_products_fk
        foreign key (published_product_id)
        references public.furniture_products(id)
        on update cascade
        on delete restrict
        not valid;

      alter table public.import_jobs
        validate constraint import_jobs_published_product_id_furniture_products_fk;
    end if;
  end if;
end $$;

create index if not exists import_jobs_published_product_id_idx
  on public.import_jobs (published_product_id)
  where published_product_id is not null;

comment on table public.recommendations is
  'Recommendation exposure/action log. furniture_id is legacy naming and stores the canonical public.furniture_products.id value.';
comment on column public.recommendations.furniture_id is
  'Legacy column name. Operationally this is canonical public.furniture_products.id.';

do $$
begin
  if to_regclass('public.recommendations') is not null
    and to_regclass('public.furniture_products') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'recommendations_furniture_id_furniture_products_fk'
        and conrelid = 'public.recommendations'::regclass
    )
  then
    if not exists (
      select 1
      from pg_attribute r_col
      join pg_attribute fp_col
        on fp_col.attrelid = 'public.furniture_products'::regclass
       and fp_col.attname = 'id'
       and fp_col.attnum > 0
       and not fp_col.attisdropped
      where r_col.attrelid = 'public.recommendations'::regclass
        and r_col.attname = 'furniture_id'
        and r_col.attnum > 0
        and not r_col.attisdropped
        and r_col.atttypid = fp_col.atttypid
    )
    then
      raise notice 'Skipped recommendations.furniture_id FK to furniture_products: column type does not match furniture_products.id.';
    elsif exists (
      select 1
      from public.recommendations r
      left join public.furniture_products fp on fp.id = r.furniture_id
      where r.furniture_id is not null
        and fp.id is null
      limit 1
    )
    then
      raise notice 'Skipped recommendations.furniture_id FK to furniture_products: orphan links exist.';
    else
      alter table public.recommendations
        add constraint recommendations_furniture_id_furniture_products_fk
        foreign key (furniture_id)
        references public.furniture_products(id)
        on update cascade
        on delete restrict
        not valid;

      alter table public.recommendations
        validate constraint recommendations_furniture_id_furniture_products_fk;
    end if;
  end if;
end $$;

comment on table public.furniture_vectors is
  'Recommendation feature table. Effective model is one current vector row per canonical product ID; legacy furniture_id naming/FK compatibility is intentionally retained in this step.';
comment on column public.furniture_vectors.furniture_id is
  'Legacy column name. Runtime expects this value to match public.furniture_products.id; FK migration away from public.furniture is deferred until live constraints are audited.';

-- Do not add another furniture_vectors(furniture_id) unique index here. Existing
-- schemas commonly use furniture_id as the primary/unique key, and this step is
-- not introducing vector versioning.
drop index if exists public.furniture_vectors_one_current_row_per_product_idx;

do $$
begin
  if to_regclass('public.furniture') is not null then
    comment on table public.furniture is
      'Legacy compatibility table only. Do not write new active products here; canonical product source is public.furniture_products. Prepared for retirement after compatibility constraints are removed.';

    create or replace function public.prevent_legacy_furniture_write()
    returns trigger
    language plpgsql
    as $function$
    begin
      raise exception 'public.furniture is frozen legacy compatibility storage; write active products to public.furniture_products';
    end;
    $function$;

    if not exists (
      select 1
      from pg_trigger
      where tgname = 'prevent_legacy_furniture_write_trigger'
        and tgrelid = 'public.furniture'::regclass
    )
    then
      create trigger prevent_legacy_furniture_write_trigger
        before insert or update or delete on public.furniture
        for each row execute function public.prevent_legacy_furniture_write();
    end if;
  end if;
end $$;

commit;

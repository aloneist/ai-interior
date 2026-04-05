begin;

alter table if exists public.recommendations
drop column if exists purchased;

commit;

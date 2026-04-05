-- Final explicit artifact for retiring the legacy runtime table.
-- Preconditions before execution:
-- 1. `npm run qa:legacy-furniture-retirement` passes against the target environment.
-- 2. No application/runtime code path reads from `public.furniture`.
-- 3. This statement is executed manually in a reviewed migration/change window.
-- 4. Do not add CASCADE. If a dependency still exists, fail and inspect it first.

begin;

drop table if exists public.furniture;

commit;

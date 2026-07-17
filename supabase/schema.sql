-- ============================================================
-- ARMAC - Trabalhe Conosco
-- Rode este script inteiro no Supabase: SQL Editor > New query
-- ============================================================

-- 1) Tabela de cargos (vagas)
create table if not exists public.cargos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  local text,
  descricao text not null,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Tabela de candidaturas
create table if not exists public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  cargo_id uuid not null references public.cargos(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text not null,
  arquivo_path text not null,
  arquivo_nome text not null,
  created_at timestamptz not null default now()
);

-- 3) Habilitar Row Level Security
alter table public.cargos enable row level security;
alter table public.candidaturas enable row level security;

-- 4) Políticas para "cargos"
-- Qualquer visitante do site pode ler apenas as vagas ativas
drop policy if exists "cargos_select_publico" on public.cargos;
create policy "cargos_select_publico"
  on public.cargos for select
  to anon
  using (ativo = true);

-- Administradores autenticados podem ler, criar, editar e excluir tudo
drop policy if exists "cargos_admin_all" on public.cargos;
create policy "cargos_admin_all"
  on public.cargos for all
  to authenticated
  using (true)
  with check (true);

-- 5) Políticas para "candidaturas"
-- Qualquer visitante pode ENVIAR uma candidatura (insert), mas não pode ler as outras
drop policy if exists "candidaturas_insert_publico" on public.candidaturas;
create policy "candidaturas_insert_publico"
  on public.candidaturas for insert
  to anon
  with check (true);

-- Somente administradores autenticados podem visualizar/gerenciar candidaturas
drop policy if exists "candidaturas_admin_select" on public.candidaturas;
create policy "candidaturas_admin_select"
  on public.candidaturas for select
  to authenticated
  using (true);

drop policy if exists "candidaturas_admin_delete" on public.candidaturas;
create policy "candidaturas_admin_delete"
  on public.candidaturas for delete
  to authenticated
  using (true);

-- ============================================================
-- 6) Storage: bucket para os currículos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('curriculos', 'curriculos', false)
on conflict (id) do nothing;

-- Visitantes podem ENVIAR (upload) currículos, mas não podem listar/ler/apagar
drop policy if exists "curriculos_insert_publico" on storage.objects;
create policy "curriculos_insert_publico"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'curriculos');

-- Somente administradores autenticados podem ler (baixar) os currículos
drop policy if exists "curriculos_admin_select" on storage.objects;
create policy "curriculos_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'curriculos');

drop policy if exists "curriculos_admin_delete" on storage.objects;
create policy "curriculos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'curriculos');

-- ============================================================
-- 7) Exemplo: cargos iniciais (edite/apague à vontade depois pelo painel)
-- ============================================================
insert into public.cargos (titulo, local, descricao, ativo, ordem) values
(
  'Mecânico de Equipamentos Pesados',
  'Manaus - AM',
  'Responsável pela manutenção preventiva e corretiva de equipamentos de linha amarela (escavadeiras, tratores, motoniveladoras).' || chr(10) ||
  'Requisitos: experiência com equipamentos pesados, curso técnico em mecânica ou similar, CNH categoria B.' || chr(10) ||
  'Benefícios: vale-transporte, vale-alimentação, plano de saúde.',
  true,
  1
),
(
  'Vendedor de Equipamentos',
  'Manaus - AM',
  'Atuação na prospecção e venda de máquinas e implementos agrícolas/industriais para clientes da região.' || chr(10) ||
  'Requisitos: ensino médio completo, experiência em vendas B2B, CNH categoria B.' || chr(10) ||
  'Benefícios: comissionamento, vale-alimentação, plano de saúde.',
  true,
  2
)
on conflict do nothing;

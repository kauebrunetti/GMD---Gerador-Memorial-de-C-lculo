-- ============================================================
-- GMD · Gerador de Memorial Descritivo — estrutura inicial
-- Projeto Supabase: [OPERACIONAL] - GMD (ref imlxmgdsoupichsymaok)
-- Já aplicada em 23/08/2026. Mantida aqui como referência e para
-- recriar o banco em outro projeto, se preciso.
-- ============================================================

-- Projetos (o documento inteiro fica em "dados"; as colunas ao lado
-- existem para busca, filtros e métricas)
create table if not exists memorial_projetos (
  id text primary key,
  dados jsonb not null,
  cliente text,
  doc_num text,
  gestor text,
  status text not null default 'rascunho',      -- rascunho | revisado | emitido
  pendencias jsonb not null default '[]'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  emitido_em timestamptz,
  excluido boolean not null default false        -- exclusão lógica (some do app, fica no banco)
);
create index if not exists memorial_projetos_atualizado_idx on memorial_projetos (atualizado_em desc);
create index if not exists memorial_projetos_gestor_idx on memorial_projetos (gestor);

-- Modelos de projeto (oficiais da BeGreen e do time)
create table if not exists memorial_modelos (
  id text primary key,
  nome text not null,
  dados jsonb not null,
  oficial boolean not null default false,
  ordem int not null default 100,
  gestor text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Configurações compartilhadas: frases prontas, fotos padrão,
-- catálogo de equipamentos, lista de gestores
create table if not exists memorial_config (
  chave text primary key,
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);

-- Numeração BG-ME-AA-NNNN sem conflito entre projetistas
create table if not exists memorial_numeracao (
  ano text primary key,
  ultimo int not null default 0
);
create or replace function memorial_proximo_numero(p_ano text)
returns int language plpgsql security definer as $$
declare n int;
begin
  insert into memorial_numeracao (ano, ultimo) values (p_ano, 1)
  on conflict (ano) do update set ultimo = memorial_numeracao.ultimo + 1
  returning ultimo into n;
  return n;
end $$;

-- Eventos para métricas (criado, revisao, emitido) por gestor
create table if not exists memorial_eventos (
  id bigserial primary key,
  tipo text not null,
  gestor text,
  projeto_id text,
  doc_num text,
  detalhes jsonb,
  criado_em timestamptz not null default now()
);
create index if not exists memorial_eventos_tipo_idx on memorial_eventos (tipo, criado_em desc);

-- Segurança: RLS ligado em tudo. Enquanto não há login, o papel "anon"
-- (chave pública) tem acesso às tabelas memorial_*. Ao ativar o
-- Supabase Auth, substituir estas políticas por "to authenticated"
-- (ver docs/SUPABASE.md).
alter table memorial_projetos enable row level security;
alter table memorial_modelos enable row level security;
alter table memorial_config enable row level security;
alter table memorial_numeracao enable row level security;
alter table memorial_eventos enable row level security;
create policy gmd_anon_projetos on memorial_projetos for all to anon using (true) with check (true);
create policy gmd_anon_modelos on memorial_modelos for all to anon using (true) with check (true);
create policy gmd_anon_config on memorial_config for all to anon using (true) with check (true);
create policy gmd_anon_numeracao on memorial_numeracao for select to anon using (true);
create policy gmd_anon_eventos on memorial_eventos for all to anon using (true) with check (true);
grant usage on schema public to anon;
grant select, insert, update, delete on memorial_projetos, memorial_modelos, memorial_config, memorial_eventos to anon;
grant select on memorial_numeracao to anon;
grant usage, select on sequence memorial_eventos_id_seq to anon;
grant execute on function memorial_proximo_numero(text) to anon;

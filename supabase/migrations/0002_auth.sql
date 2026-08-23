-- ============================================================
-- GMD · 0002 — Login com Supabase Auth
-- Acesso só para usuários autenticados E presentes na lista de
-- autorizados (memorial_usuarios). O admin cadastra os e-mails;
-- cada pessoa cria a própria senha no primeiro acesso.
-- ============================================================

-- Lista de pessoas autorizadas (o e-mail precisa bater com o do login)
create table if not exists memorial_usuarios (
  email text primary key,
  nome text not null,
  papel text not null default 'projetista',   -- admin | projetista
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Funções auxiliares (security definer: leem a lista mesmo com RLS)
create or replace function memorial_email_atual() returns text
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function memorial_usuario_ativo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memorial_usuarios u
    where lower(u.email) = memorial_email_atual() and u.ativo
  );
$$;

create or replace function memorial_eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memorial_usuarios u
    where lower(u.email) = memorial_email_atual() and u.ativo and u.papel = 'admin'
  );
$$;

-- Usada pela tela de primeiro acesso, antes do login: só diz se o e-mail pode criar conta
create or replace function memorial_email_autorizado(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memorial_usuarios u where lower(u.email) = lower(trim(p_email)) and u.ativo);
$$;

-- Dados do usuário logado (nome e papel)
create or replace function memorial_meu_usuario()
returns table (email text, nome text, papel text)
language sql stable security definer set search_path = public as $$
  select u.email, u.nome, u.papel from memorial_usuarios u
  where lower(u.email) = memorial_email_atual() and u.ativo;
$$;

-- Numeração: só para usuários autorizados
create or replace function memorial_proximo_numero(p_ano text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not memorial_usuario_ativo() then
    raise exception 'usuário não autorizado';
  end if;
  insert into memorial_numeracao (ano, ultimo) values (p_ano, 1)
  on conflict (ano) do update set ultimo = memorial_numeracao.ultimo + 1
  returning ultimo into n;
  return n;
end $$;

-- Políticas: sai o acesso anônimo, entra "autenticado e autorizado"
drop policy if exists gmd_anon_projetos on memorial_projetos;
drop policy if exists gmd_anon_modelos on memorial_modelos;
drop policy if exists gmd_anon_config on memorial_config;
drop policy if exists gmd_anon_numeracao on memorial_numeracao;
drop policy if exists gmd_anon_eventos on memorial_eventos;

create policy gmd_auth_projetos on memorial_projetos for all to authenticated using (memorial_usuario_ativo()) with check (memorial_usuario_ativo());
create policy gmd_auth_modelos on memorial_modelos for all to authenticated using (memorial_usuario_ativo()) with check (memorial_usuario_ativo());
create policy gmd_auth_config on memorial_config for all to authenticated using (memorial_usuario_ativo()) with check (memorial_usuario_ativo());
create policy gmd_auth_numeracao on memorial_numeracao for select to authenticated using (memorial_usuario_ativo());
create policy gmd_auth_eventos on memorial_eventos for all to authenticated using (memorial_usuario_ativo()) with check (memorial_usuario_ativo());

alter table memorial_usuarios enable row level security;
create policy gmd_usuarios_ver on memorial_usuarios for select to authenticated using (memorial_usuario_ativo());
create policy gmd_usuarios_admin_ins on memorial_usuarios for insert to authenticated with check (memorial_eh_admin());
create policy gmd_usuarios_admin_upd on memorial_usuarios for update to authenticated using (memorial_eh_admin()) with check (memorial_eh_admin());
create policy gmd_usuarios_admin_del on memorial_usuarios for delete to authenticated using (memorial_eh_admin() and lower(email) <> memorial_email_atual());

-- Permissões por papel do Postgres
revoke all on memorial_projetos, memorial_modelos, memorial_config, memorial_eventos, memorial_numeracao from anon;
revoke execute on function memorial_proximo_numero(text) from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on memorial_projetos, memorial_modelos, memorial_config, memorial_eventos, memorial_usuarios to authenticated;
grant select on memorial_numeracao to authenticated;
grant usage, select on sequence memorial_eventos_id_seq to authenticated;
grant execute on function memorial_proximo_numero(text), memorial_usuario_ativo(), memorial_eh_admin(), memorial_meu_usuario(), memorial_email_atual() to authenticated;
grant execute on function memorial_email_autorizado(text) to anon, authenticated;

-- Primeiro administrador
insert into memorial_usuarios (email, nome, papel) values ('kba@mybegreen.com.br', 'Kauê Brunetti', 'admin')
on conflict (email) do update set papel = 'admin', ativo = true;

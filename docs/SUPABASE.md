# Banco de dados · Supabase

Projeto: **[OPERACIONAL] - GMD** · ref `imlxmgdsoupichsymaok` · região São Paulo (sa-east-1) · plano Free.
Painel: <https://supabase.com/dashboard/project/imlxmgdsoupichsymaok>

O app fala com o banco pela API REST do Supabase (`js/sync.js`), usando a URL e a chave pública gravadas em `js/config.js`.

## Tabelas

| Tabela | Conteúdo |
|---|---|
| `memorial_projetos` | Um registro por memorial. `dados` guarda o projeto inteiro (JSON); `cliente`, `doc_num`, `gestor`, `status`, `pendencias` e datas servem para busca e métricas. `excluido = true` é exclusão lógica. |
| `memorial_modelos` | Modelos de projeto. `oficial = true` são os modelos BeGreen (o app não permite excluí-los). |
| `memorial_config` | Pares chave/valor compartilhados: `frases`, `fotos_padrao`, `catalogo`, `gestores`. |
| `memorial_numeracao` + função `memorial_proximo_numero(ano)` | Sequência `BG-ME-AA-NNNN` por ano; a função é atômica, então duas pessoas nunca recebem o mesmo número. |
| `memorial_eventos` | `criado`, `revisao`, `emitido`, com gestor e data, para as métricas. |

O SQL completo está em [`supabase/migrations/0001_estrutura_inicial.sql`](../supabase/migrations/0001_estrutura_inicial.sql).

## Como o app sincroniza

- Ao abrir: carrega o cache do navegador (localStorage), depois busca a nuvem e mescla; vence o registro com `atualizado_em` mais recente. Projetos locais que a nuvem não conhece sobem; projetos marcados `excluido` somem.
- Ao editar: salva no cache na hora e envia à nuvem 0,8 s depois da última alteração.
- Sem conexão: a barra de status mostra "● nuvem indisponível" e tudo continua funcionando localmente; na próxima abertura com internet, os dados sobem.

## Chaves

- `js/config.js` usa a chave **publishable** (pública). Ela pode ficar no repositório: só tem o acesso que as políticas (RLS) permitem.
- A chave `service_role` dá acesso total e **nunca** deve ir para o front-end nem para o repositório.
- Para trocar a chave (rotação): painel → *Project Settings → API Keys*, gere uma nova publishable, atualize `js/config.js`, faça o push e desative a antiga.

## Segurança atual e próximo passo (login)

Hoje as políticas liberam as tabelas `memorial_*` para o papel `anon` (quem tiver a chave pública). Isso é aceitável para uma ferramenta interna com link não divulgado, mas o próximo passo previsto é o **Supabase Auth** (e-mail + senha):

1. Painel → *Authentication → Providers*: manter só *Email*, desativar *Allow new users to sign up* (contas criadas pelo administrador).
2. Criar os usuários em *Authentication → Users → Add user* (ou por convite por e-mail).
3. Trocar as políticas de `to anon` para `to authenticated` (nova migração `0002_auth.sql`).
4. No app: tela de login, sessão lembrada, botão sair; o "gestor" passa a ser o usuário logado.

## Backup

- Plano Free não tem backup automático diário. Uma vez por semana, exporte: painel → *Database → Backups* (ou rode `select * from memorial_projetos` no *SQL Editor* e baixe como CSV/JSON).
- Projetos Free **pausam após 7 dias sem uso**; basta clicar em *Restore project* no painel. Uso diário do app evita a pausa.

## Aplicar uma nova migração

1. Crie `supabase/migrations/000N_descricao.sql` no repositório.
2. Cole o conteúdo no painel → *SQL Editor* → *Run*.
3. Faça o commit do arquivo para o histórico ficar no GitHub.

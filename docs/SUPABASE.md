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

## Login (Supabase Auth)

Desde a migração `0002_auth.sql` o acesso exige **e-mail + senha** e o e-mail precisa estar na tabela `memorial_usuarios` (lista de autorizados). As políticas (RLS) liberam as tabelas `memorial_*` só para usuários autenticados **e** presentes nessa lista; a chave pública sozinha não lê nem grava nada.

- **Cadastrar alguém:** no app, Novo ▾ → **Equipe** (só administradores) → e-mail, nome e papel. A pessoa entra em **Primeiro acesso** na tela de entrada e cria a própria senha. Se o projeto exigir confirmação de e-mail (padrão do Supabase), ela recebe um link antes de conseguir entrar.
- **Desativar/remover:** mesma tela; o bloqueio vale na hora.
- **Papéis:** `admin` (gerencia a equipe) e `projetista`. O primeiro admin é `kba@mybegreen.com.br`.
- **Gestor de projeto** nas métricas = nome cadastrado na equipe.
- **Esqueci a senha:** link por e-mail; abre o app em modo "Nova senha".

Configuração necessária no painel (uma vez), em *Authentication → URL Configuration*:
- **Site URL:** `https://bg-gmd.vercel.app`
- **Redirect URLs:** `https://bg-gmd.vercel.app/**` e `http://localhost:4620/**`

Em *Authentication → Providers → Email* mantenha **Enable Email provider** ligado e *Allow new users to sign up* ligado: o cadastro é controlado pela lista de autorizados, não pela opção do painel. O envio de e-mails usa o SMTP padrão do Supabase (limite baixo, da ordem de poucos e-mails por hora); para uma equipe maior, configure SMTP próprio em *Authentication → SMTP Settings*.

## Backup

- Plano Free não tem backup automático diário. Uma vez por semana, exporte: painel → *Database → Backups* (ou rode `select * from memorial_projetos` no *SQL Editor* e baixe como CSV/JSON).
- Projetos Free **pausam após 7 dias sem uso**; basta clicar em *Restore project* no painel. Uso diário do app evita a pausa.

## Aplicar uma nova migração

1. Crie `supabase/migrations/000N_descricao.sql` no repositório.
2. Cole o conteúdo no painel → *SQL Editor* → *Run*.
3. Faça o commit do arquivo para o histórico ficar no GitHub.

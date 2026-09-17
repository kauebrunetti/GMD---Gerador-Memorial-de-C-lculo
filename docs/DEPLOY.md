# Deploy · GitHub + Vercel

Fluxo: o código fica no GitHub; a Vercel observa a branch `main` e publica cada `push` automaticamente. O banco (Supabase) não muda com o deploy.

## 1 · Criar o repositório no GitHub (uma vez)

1. Entre em <https://github.com/new>.
2. **Repository name:** `gmd-gerador-memorial` (ou o nome que preferir).
3. **Visibility:** `Private` (ferramenta interna).
4. **Não** marque "Add a README", "Add .gitignore" nem "Choose a license" (já estão nesta pasta).
5. Clique em **Create repository** e deixe a página aberta: ela mostra a URL do repositório, no formato `https://github.com/SEU-USUARIO/gmd-gerador-memorial.git`.

## 2 · Subir esta pasta para o repositório

No Terminal, dentro da pasta do projeto (`GMD - Gerador Memorial Descritivo`):

```bash
cd "/Users/kauebrunetti/Desktop/AA IA/GMD - Gerador Memorial Descritivo"
```

```bash
git init -b main
```

```bash
git add .
```

```bash
git commit -m "GMD: versão inicial do Gerador de Memorial Descritivo"
```

Troque a URL abaixo pela URL que o GitHub mostrou:

```bash
git remote add origin https://github.com/SEU-USUARIO/gmd-gerador-memorial.git
```

```bash
git push -u origin main
```

Na primeira vez o GitHub pede login. Se pedir senha no Terminal, use um *Personal Access Token* (GitHub → Settings → Developer settings → Personal access tokens) no lugar da senha, ou instale o GitHub Desktop e faça o push por ele.

## 3 · Conectar a Vercel (uma vez)

1. Entre em <https://vercel.com> com a conta do GitHub (**Continue with GitHub**).
2. **Add New… → Project** → **Import** ao lado de `gmd-gerador-memorial` (se não aparecer, clique em *Adjust GitHub App Permissions* e libere o repositório).
3. Configuração do projeto:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (deixe como está)
   - **Build Command:** vazio (não há build)
   - **Output Directory:** vazio (a raiz já é o site)
   - Variáveis de ambiente: nenhuma (a chave pública do Supabase está em `js/config.js`)
4. **Deploy**. Em cerca de um minuto a Vercel mostra o link, algo como `https://gmd-gerador-memorial.vercel.app`.

A partir daqui, todo `git push` na `main` publica uma nova versão. Cada *pull request* ganha um link de pré-visualização próprio.

## 4 · Subdomínio da BeGreen (opcional)

Endereço escolhido: **https://gmd.mybegreen.com.br**

1. Na Vercel: projeto **bg-gmd → Settings → Domains → Add** → digite `gmd.mybegreen.com.br` → Add. A Vercel passa a exibir o domínio como "Invalid configuration" até o DNS existir.
2. No provedor de DNS do `mybegreen.com.br` (Registro.br, Cloudflare, GoDaddy…), crie o registro:

   | Tipo  | Nome / Host | Valor / Destino          | TTL      |
   |-------|-------------|--------------------------|----------|
   | CNAME | `gmd`       | `cname.vercel-dns.com`   | 3600 (ou automático) |

   Alguns painéis pedem o nome completo (`gmd.mybegreen.com.br`) e o destino com ponto final (`cname.vercel-dns.com.`); ambos são equivalentes.
3. Aguarde a propagação (minutos a algumas horas). Na Vercel o domínio fica "Valid Configuration" e o certificado HTTPS é emitido sozinho.
4. No Supabase (**Authentication → URL Configuration**) adicione `https://gmd.mybegreen.com.br` em *Site URL* e `https://gmd.mybegreen.com.br/**` em *Redirect URLs*, senão os e-mails de primeiro acesso / senha continuam levando ao endereço antigo.

O endereço `https://bg-gmd.vercel.app` continua funcionando em paralelo.

## 5 · Atualizações no dia a dia

```bash
git add .
```

```bash
git commit -m "descreva o que mudou"
```

```bash
git push
```

Para mudanças maiores, trabalhe numa branch (`git checkout -b ajuste-x`), abra um *pull request* no GitHub, teste no link de pré-visualização que a Vercel gera e só então faça o *merge* na `main`.

## 6 · Se algo der errado

- **Deploy falhou na Vercel:** abra o deploy, aba *Building*; como não há build, falhas costumam ser de configuração (Framework Preset deve ser `Other`, Output Directory vazio).
- **Página abre mas "nuvem indisponível":** confira `js/config.js` (URL e chave) e se o projeto Supabase está ativo (projetos do plano free pausam após 7 dias sem uso; basta *Restore* no painel).
- **Voltar uma versão:** na Vercel, aba *Deployments*, escolha o deploy anterior → *Promote to Production*.

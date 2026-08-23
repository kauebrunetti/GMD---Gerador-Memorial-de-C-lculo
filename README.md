# GMD · Gerador de Memorial Descritivo

Ferramenta interna da **BeGreen Mobilidade Elétrica** para elaborar o memorial descritivo de infraestrutura de recarga de veículos elétricos (ABNT NBR 5410 e NBR 17019).

O engenheiro preenche os parâmetros da obra, vê o documento A4 montado ao vivo (a prévia é idêntica ao PDF) e emite o PDF com cálculos, tabelas, diagrama unifilar e controle de revisões. Os projetos ficam numa base compartilhada (Supabase) e a aplicação é publicada na Vercel.

| Camada | Tecnologia |
|---|---|
| Aplicação | HTML, CSS e JavaScript puros, sem build e sem dependências |
| Hospedagem | Vercel (site estático) a partir do GitHub |
| Dados | Supabase (Postgres + REST) · projeto `[OPERACIONAL] - GMD` |
| PDF | Impressão nativa do navegador (Ctrl/Cmd + P) sobre páginas A4 paginadas pelo app |

## Estrutura

```
.
├── index.html                 # casca da aplicação
├── css/app.css                # interface + páginas A4 + regras de impressão
├── js/
│   ├── config.js              # URL e chave pública do Supabase
│   ├── sync.js                # acesso REST ao Supabase (projetos, modelos, config, numeração, eventos)
│   ├── calc.js                # dimensionamento (NBR 5410/17019): correntes, cabos, eletrodutos, proteções, ΔV
│   ├── diagram.js             # diagrama unifilar em SVG
│   ├── template.js            # conteúdo do memorial (capa, seções, tabelas, conclusões)
│   ├── paginar.js             # paginação fiel em folhas A4 (quadros nunca dividem, índice com páginas)
│   └── app.js                 # formulário, estado, pendências, fluxo de aprovação, métricas, exportação
├── assets/                    # logos e ilustrações padrão
├── mockups/layouts.html       # comparação de layouts (referência, não usada pelo app)
├── supabase/migrations/       # SQL da estrutura do banco
├── docs/                      # guias de deploy e do banco
├── server.js                  # servidor local simples (node server.js → http://localhost:4620)
└── vercel.json                # configuração do site estático na Vercel
```

## Rodar localmente

Só precisa do Node instalado (qualquer versão recente):

```bash
npm start
```

Abra <http://localhost:4620>. No macOS também dá para dar dois cliques em `Iniciar Gerador de Memorial.command`.

Sem conexão com o Supabase o app continua funcionando com o cache do navegador (localStorage) e avisa "nuvem indisponível" na barra de status.

## Publicar

O deploy é automático: todo `push` na branch `main` publica na Vercel. Passo a passo da primeira configuração em [docs/DEPLOY.md](docs/DEPLOY.md). Estrutura e políticas do banco em [docs/SUPABASE.md](docs/SUPABASE.md).

## Fluxo de trabalho no dia a dia

1. **Novo ▾** → projeto em branco, modelo oficial BeGreen ou modelo do time; ou **Duplicar** o projeto atual (mesmos parâmetros, novo cliente).
2. O número `BG-ME-AA-NNNN` é gerado na nuvem, sem conflito entre projetistas.
3. Preencha os parâmetros; o quadro **Pendências** lista o que falta e leva ao campo.
4. Sem pendências: **Marcar como revisado → Emitir**. Emitido trava os campos e libera **Gerar PDF** e **Baixar HTML** (nome `BG-ME-26-0001_Rev00_Cliente.pdf`).
5. Para alterar um documento emitido: **Nova revisão** (guarda a versão anterior e avança Rev. 00 → 01).
6. **Métricas** mostra memoriais por semana e por gestor de projeto.

## Convenções

- Código e textos em português; sem framework e sem etapa de build (o que está no repositório é o que a Vercel serve).
- Regras de dimensionamento ficam só em `js/calc.js`; textos do documento só em `js/template.js`.
- Alterações no banco entram como novo arquivo em `supabase/migrations/` (numerado) e são aplicadas no painel do Supabase.
- A chave em `js/config.js` é a chave **pública** (publishable) do Supabase; ela só tem o acesso que as políticas do banco permitem. Nunca coloque a `service_role` no front-end.

## Licença

Uso interno da BeGreen Mobilidade Elétrica. Todos os direitos reservados.

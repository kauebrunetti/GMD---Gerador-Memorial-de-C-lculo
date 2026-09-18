# Como regenerar o treinamento

1. Suba a cópia demo do app (mock de login) e inclua `cena.js` no `index.html` da demo: ele monta as telas (`?cena=menu`, `etapa5`, `pendencias`, `doc:3`…) para captura.
2. Capture com o Chrome headless (2×, 1440×860) para uma pasta `shots/` e recorte/arredonde as imagens (`r_*.png` + `dims.json`).
3. `npm i pptxgenjs@3` e `node gerar.js` → gera o .pptx em `docs/treinamento/`.
4. PDF: abrir no PowerPoint e Salvar como PDF (ou via AppleScript, como no histórico do projeto).

#!/bin/bash
# Inicia o Gerador de Memorial Descritivo e abre no navegador.
# Dê dois cliques neste arquivo. Para parar, feche a janela do Terminal.
cd "$(dirname "$0")"
if curl -s -o /dev/null http://localhost:4620/; then
  echo "Servidor já está rodando."
else
  echo "Iniciando servidor em http://localhost:4620 ..."
  node server.js &
  sleep 1
fi
open "http://localhost:4620"
echo
echo "Gerador de Memorial Descritivo rodando em http://localhost:4620"
echo "Mantenha esta janela aberta enquanto usar a ferramenta."
wait
